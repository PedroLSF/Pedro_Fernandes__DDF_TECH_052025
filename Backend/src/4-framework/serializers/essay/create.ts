import { EssayStatusType, IEssay } from '@domain/entities/essay';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class InputCreateEssay implements Partial<IEssay> {
  @ApiProperty({ description: 'Title', example: 'Essay title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Text', example: 'O Ciclo do...' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Theme',
    example: 'Valorização da Identidade Africana',
  })
  @IsNotEmpty()
  @IsString()
  theme: string;

  @ApiProperty({
    description: 'Note',
    example: 100,
  })
  @IsOptional()
  @Min(0)
  @Max(100)
  @IsNumber()
  note?: number | null;

  @ApiProperty({ description: 'user_id', example: 'user_123' })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({
    description: 'EssayStatusType',
    example: EssayStatusType.Submitted,
  })
  @IsOptional()
  @IsEnum(EssayStatusType)
  status: EssayStatusType;
}
