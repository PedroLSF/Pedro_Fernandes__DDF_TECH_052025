import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EssayStatusType } from '@domain/entities/essay';
import { EssayEntity } from './essay';

export class InputUpdateEssay implements Partial<EssayEntity> {
  @ApiProperty({ description: 'Title', example: 'Essay title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Text', example: 'O Ciclo do...' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'EssayStatusType',
    example: EssayStatusType.Submitted,
  })
  @IsOptional()
  @IsEnum(EssayStatusType)
  status: EssayStatusType;
}
