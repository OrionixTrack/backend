import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as mqtt from 'mqtt';
import { Tracker } from '../common/entities';
import { IotService } from './iot.service';
import { TelemetryDto } from './dto';
import {
  MQTT_TOPICS,
  MQTT_CONFIG,
  TELEMETRY_TOPIC_PATTERN,
} from './iot.constants';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { TelemetryUpdateDto } from '../realtime/dto';

@Injectable()
export class MqttClientService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttClientService.name);
  private client: mqtt.MqttClient | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly iotService: IotService,
    @Inject(forwardRef(() => RealtimeGateway))
    private readonly realtimeGateway: RealtimeGateway,
    @InjectRepository(Tracker)
    private trackerRepository: Repository<Tracker>,
  ) {}

  onModuleInit() {
    this.connect();
  }

  onModuleDestroy() {
    this.disconnect();
  }

  private connect(): void {
    const host = this.configService.get<string>('MQTT_HOST');
    const port = this.configService.get<number>('MQTT_PORT');
    const username = this.configService.get<string>(
      'MQTT_INTERNAL_USERNAME',
      'backend_service',
    );
    const password = this.configService.get<string>(
      'MQTT_INTERNAL_PASSWORD',
      'backend_service_password',
    );

    const url = `mqtt://${host}:${port}`;

    this.logger.log(`Connecting to MQTT broker at ${url}`);

    this.client = mqtt.connect(url, {
      username,
      password,
      clientId: `orionix-backend-${Date.now()}`,
      reconnectPeriod: MQTT_CONFIG.RECONNECT_PERIOD_MS,
      connectTimeout: MQTT_CONFIG.CONNECT_TIMEOUT_MS,
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
      this.subscribe();
    });

    this.client.on('message', (topic, payload) => {
      void this.handleMessage(topic, payload);
    });

    this.client.on('error', (error) => {
      this.logger.error(`MQTT error: ${error.message}`);
    });

    this.client.on('reconnect', () => {
      this.logger.log('Reconnecting to MQTT broker...');
    });

    this.client.on('offline', () => {
      this.logger.warn('MQTT client is offline');
    });
  }

  private disconnect(): void {
    if (this.client) {
      this.client.end();
      this.logger.log('Disconnected from MQTT broker');
    }
  }

  private subscribe(): void {
    if (!this.client) return;

    this.client.subscribe(
      MQTT_TOPICS.TELEMETRY_WILDCARD,
      { qos: MQTT_CONFIG.QOS },
      (err) => {
        if (err) {
          this.logger.error(
            `Failed to subscribe to ${MQTT_TOPICS.TELEMETRY_WILDCARD}: ${err.message}`,
          );
        } else {
          this.logger.log(`Subscribed to ${MQTT_TOPICS.TELEMETRY_WILDCARD}`);
        }
      },
    );
  }

  private async handleMessage(topic: string, payload: Buffer): Promise<void> {
    const match = topic.match(TELEMETRY_TOPIC_PATTERN);
    if (!match) {
      this.logger.warn(`Invalid topic format: ${topic}`);
      return;
    }

    const trackerId = parseInt(match[1], 10);

    try {
      const parsed: unknown = JSON.parse(payload.toString());
      const data = plainToInstance(TelemetryDto, parsed);

      const errors = await validate(data);
      if (errors.length > 0) {
        const errorMessages = errors
          .map((e) => Object.values(e.constraints ?? {}).join(', '))
          .join('; ');
        this.logger.warn(
          `Invalid telemetry from tracker ${trackerId}: ${errorMessages}`,
        );
        return;
      }

      const tracker = await this.trackerRepository.findOne({
        where: { tracker_id: trackerId },
      });

      if (!tracker) {
        this.logger.warn(`Tracker ${trackerId} not found`);
        return;
      }

      const result = await this.iotService.saveTelemetry(tracker, data);

      if (result) {
        const channelTokens = await this.iotService.getChannelTokensByTripId(
          result.tripId,
        );

        const telemetryUpdate: TelemetryUpdateDto = {
          tripId: result.tripId,
          latitude: Number(result.sensorData.latitude),
          longitude: Number(result.sensorData.longitude),
          speed: result.sensorData.speed
            ? Number(result.sensorData.speed)
            : undefined,
          datetime: result.sensorData.datetime,
          temperature: result.sensorData.temperature
            ? Number(result.sensorData.temperature)
            : undefined,
          humidity: result.sensorData.humidity
            ? Number(result.sensorData.humidity)
            : undefined,
        };

        this.realtimeGateway.broadcastTelemetry(
          result.tripId,
          result.companyId,
          channelTokens,
          telemetryUpdate,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to process message from ${topic}: ${(error as Error).message}`,
      );
    }
  }
}
