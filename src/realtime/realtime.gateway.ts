import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RealtimeService } from './realtime.service';
import {
  PositionUpdateDto,
  TelemetryUpdateDto,
  TripStatusUpdateDto,
  SubscribeChannelDto,
  SubscribeTripDto,
  SubscribeCompanyDto,
} from './dto';

const IncomingEvents = {
  SUBSCRIBE_CHANNEL: 'subscribe:channel',
  UNSUBSCRIBE_CHANNEL: 'unsubscribe:channel',
  CHANNEL_REASSIGNED: 'channel:reassigned',
  SUBSCRIBE_TRIP: 'subscribe:trip',
  UNSUBSCRIBE_TRIP: 'unsubscribe:trip',
  SUBSCRIBE_COMPANY: 'subscribe:company',
  UNSUBSCRIBE_COMPANY: 'unsubscribe:company',
} as const;

const OutgoingEvents = {
  TELEMETRY_UPDATE: 'telemetry:update',
  POSITION_UPDATE: 'position:update',
  TRIP_STATUS: 'trip:status',
} as const;

const Rooms = {
  CHANNEL: (token: string) => `channel:${token}`,
  TRIP: (tripId: number) => `trip:${tripId}`,
  COMPANY: (companyId: number) => `company:${companyId}`,
} as const;

const INVALID_PAYLOAD = 'Invalid payload';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/tracking',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(IncomingEvents.SUBSCRIBE_CHANNEL)
  async handleSubscribeChannel(
    @MessageBody() payload: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const dto = await this.validatePayload(SubscribeChannelDto, payload);
    if (!dto) {
      return this.emitError(
        client,
        IncomingEvents.SUBSCRIBE_CHANNEL,
        INVALID_PAYLOAD,
      );
    }

    const result = await this.realtimeService.validateChannelSubscription(
      dto.token,
    );

    if (!result.success) {
      return this.emitError(
        client,
        IncomingEvents.SUBSCRIBE_CHANNEL,
        result.error,
      );
    }

    await client.join(Rooms.CHANNEL(dto.token));
    this.logger.log(`Client ${client.id} subscribed to channel ${dto.token}`);
  }

  @SubscribeMessage(IncomingEvents.UNSUBSCRIBE_CHANNEL)
  async handleUnsubscribeChannel(
    @MessageBody() payload: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const dto = await this.validatePayload(SubscribeChannelDto, payload);
    if (!dto) {
      return this.emitError(
        client,
        IncomingEvents.UNSUBSCRIBE_CHANNEL,
        INVALID_PAYLOAD,
      );
    }

    await client.leave(Rooms.CHANNEL(dto.token));
    this.logger.log(
      `Client ${client.id} unsubscribed from channel ${dto.token}`,
    );
  }

  @SubscribeMessage(IncomingEvents.SUBSCRIBE_TRIP)
  async handleSubscribeTrip(
    @MessageBody() payload: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const dto = await this.validatePayload(SubscribeTripDto, payload);
    if (!dto) {
      return this.emitError(
        client,
        IncomingEvents.SUBSCRIBE_TRIP,
        INVALID_PAYLOAD,
      );
    }

    const authToken = this.extractAuthToken(client);
    if (!authToken) {
      return this.emitError(
        client,
        IncomingEvents.SUBSCRIBE_TRIP,
        'Authorization required',
      );
    }

    const result = await this.realtimeService.validateTripSubscription(
      authToken,
      dto.tripId,
    );

    if (!result.success) {
      return this.emitError(
        client,
        IncomingEvents.SUBSCRIBE_TRIP,
        result.error,
      );
    }

    await client.join(Rooms.TRIP(dto.tripId));
    this.logger.log(`Client ${client.id} subscribed to trip ${dto.tripId}`);
  }

  @SubscribeMessage(IncomingEvents.UNSUBSCRIBE_TRIP)
  async handleUnsubscribeTrip(
    @MessageBody() payload: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const dto = await this.validatePayload(SubscribeTripDto, payload);
    if (!dto) {
      return this.emitError(
        client,
        IncomingEvents.UNSUBSCRIBE_TRIP,
        INVALID_PAYLOAD,
      );
    }

    await client.leave(Rooms.TRIP(dto.tripId));
    this.logger.log(`Client ${client.id} unsubscribed from trip ${dto.tripId}`);
  }

  @SubscribeMessage(IncomingEvents.SUBSCRIBE_COMPANY)
  async handleSubscribeCompany(
    @MessageBody() payload: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const dto = await this.validatePayload(SubscribeCompanyDto, payload);
    if (!dto) {
      return this.emitError(
        client,
        IncomingEvents.SUBSCRIBE_COMPANY,
        INVALID_PAYLOAD,
      );
    }

    const authToken = this.extractAuthToken(client);
    if (!authToken) {
      return this.emitError(
        client,
        IncomingEvents.SUBSCRIBE_COMPANY,
        'Authorization required',
      );
    }

    const result = this.realtimeService.validateCompanySubscription(
      authToken,
      dto.companyId,
    );

    if (!result.success) {
      return this.emitError(
        client,
        IncomingEvents.SUBSCRIBE_COMPANY,
        result.error,
      );
    }

    await client.join(Rooms.COMPANY(dto.companyId));
    this.logger.log(
      `Client ${client.id} subscribed to company ${dto.companyId}`,
    );
  }

  @SubscribeMessage(IncomingEvents.UNSUBSCRIBE_COMPANY)
  async handleUnsubscribeCompany(
    @MessageBody() payload: unknown,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const dto = await this.validatePayload(SubscribeCompanyDto, payload);
    if (!dto) {
      return this.emitError(
        client,
        IncomingEvents.UNSUBSCRIBE_COMPANY,
        INVALID_PAYLOAD,
      );
    }

    await client.leave(Rooms.COMPANY(dto.companyId));
    this.logger.log(
      `Client ${client.id} unsubscribed from company ${dto.companyId}`,
    );
  }

  broadcastTelemetry(
    tripId: number,
    companyId: number,
    channelTokens: string[],
    telemetry: TelemetryUpdateDto,
  ): void {
    this.server
      .to(Rooms.TRIP(tripId))
      .emit(OutgoingEvents.TELEMETRY_UPDATE, telemetry);

    this.server
      .to(Rooms.COMPANY(companyId))
      .emit(OutgoingEvents.TELEMETRY_UPDATE, telemetry);

    const positionUpdate: PositionUpdateDto = {
      tripId: telemetry.tripId,
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      speed: telemetry.speed,
      datetime: telemetry.datetime,
    };

    this.emitToChannels(
      channelTokens,
      OutgoingEvents.POSITION_UPDATE,
      positionUpdate,
    );
  }

  broadcastTripStatusChange(
    tripId: number,
    companyId: number,
    channelTokens: string[],
    statusUpdate: TripStatusUpdateDto,
  ): void {
    this.server
      .to(Rooms.TRIP(tripId))
      .emit(OutgoingEvents.TRIP_STATUS, statusUpdate);

    this.server
      .to(Rooms.COMPANY(companyId))
      .emit(OutgoingEvents.TRIP_STATUS, statusUpdate);

    this.emitToChannels(
      channelTokens,
      OutgoingEvents.TRIP_STATUS,
      statusUpdate,
    );
  }

  broadcastChannelReassigned(
    channelToken: string,
    newTripId: number | null,
  ): void {
    this.server
      .to(Rooms.CHANNEL(channelToken))
      .emit(IncomingEvents.CHANNEL_REASSIGNED, { tripId: newTripId });
  }

  private emitError(client: Socket, event: string, error: string): void {
    client.emit('error', { event, error });
  }

  private async validatePayload<T extends object>(
    DtoClass: new () => T,
    payload: unknown,
  ): Promise<T | null> {
    const dto = plainToInstance(DtoClass, payload);
    const errors: ValidationError[] = await validate(dto);
    return errors.length > 0 ? null : dto;
  }

  private emitToChannels(tokens: string[], event: string, data: unknown): void {
    for (const token of tokens) {
      this.server.to(Rooms.CHANNEL(token)).emit(event, data);
    }
  }

  private extractAuthToken(client: Socket): string | null {
    const auth = client.handshake.auth?.token as string | undefined;
    if (auth) {
      return auth;
    }

    const header = client.handshake.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice(7);
    }

    return null;
  }
}
