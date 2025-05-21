import { EssayStatusType, IEssay } from '@domain/entities/essay';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InputCreateEssay implements Partial<IEssay> {
  @ApiProperty({ description: 'Title', example: 'Essay title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Text', example: 'O Ciclo do...' })
  @IsNotEmpty()
  @IsString()
  text: string;

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
