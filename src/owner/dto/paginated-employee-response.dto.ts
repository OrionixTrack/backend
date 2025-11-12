import { ApiProperty } from '@nestjs/swagger';
import { EmployeeResponseDto } from './employee-response.dto';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Total number of items',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Number of items returned',
    example: 10,
  })
  count: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Number of items skipped',
    example: 0,
  })
  offset: number;

  @ApiProperty({
    description: 'Whether there are more items',
    example: true,
  })
  hasMore: boolean;
}

export class PaginatedEmployeeResponseDto {
  @ApiProperty({
    description: 'Array of employees',
    type: [EmployeeResponseDto],
  })
  data: EmployeeResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
