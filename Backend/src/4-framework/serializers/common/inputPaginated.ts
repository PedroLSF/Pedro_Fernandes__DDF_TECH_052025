import { IsInt, IsObject, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InputPaginated<T extends object> {
  @ApiProperty({
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  take: number;

  @ApiProperty({
    example: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip: number;

  @ApiProperty({
    example: { name: 'filter' },
  })
  @IsOptional()
  filter: any;

  @ApiProperty({
    example: { name: 'asc' },
  })
  @IsObject()
  @IsOptional()
  order?: Partial<Record<keyof T, 'desc' | 'asc'>>;
}
