import { IPlanning } from '@domain/entities/planning';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class InputCreatePlanning implements Partial<IPlanning> {
  @ApiProperty({ description: 'Title', example: 'Essay title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Theme',
    example: 'Valorização da Identidade Africana',
  })
  @IsNotEmpty()
  @IsString()
  theme: string;

  @ApiProperty({ description: 'user_id', example: 'user_123' })
  @IsNotEmpty()
  @IsString()
  user_id: string;

  @ApiProperty({ description: 'essay_id', example: 'essay_123' })
  @IsNotEmpty()
  @IsString()
  essay_id: string;
}
