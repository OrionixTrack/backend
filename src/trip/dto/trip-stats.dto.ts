import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class MetricStats {
  @ApiProperty()
  min: number;

  @ApiProperty()
  max: number;

  @ApiProperty()
  avg: number;
}

export class ChartSeriesPoint {
  @ApiProperty()
  datetime: Date;

  @ApiProperty()
  value: number;
}

export class TripStatsResponseDto {
  @ApiProperty()
  tripId: number;

  @ApiProperty()
  totalPoints: number;

  @ApiPropertyOptional({ type: MetricStats })
  temperature?: MetricStats;

  @ApiPropertyOptional({ type: MetricStats })
  humidity?: MetricStats;

  @ApiPropertyOptional({ type: MetricStats })
  speed?: MetricStats;

  @ApiPropertyOptional({ type: [ChartSeriesPoint] })
  temperatureChart?: ChartSeriesPoint[];

  @ApiPropertyOptional({ type: [ChartSeriesPoint] })
  humidityChart?: ChartSeriesPoint[];

  @ApiPropertyOptional({ type: [ChartSeriesPoint] })
  speedChart?: ChartSeriesPoint[];
}
