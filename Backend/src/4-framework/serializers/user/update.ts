import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { UserEntity } from './user';

export class InputUpdateUser implements Partial<UserEntity> {
  @ApiProperty({ description: 'Name', example: 'User name' })
  @IsOptional()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email', example: 'userEmail@example.com' })
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty({ description: 'Email', example: 'userEmail@example.com' })
  @IsOptional()
  @IsString()
  password: string;

  @ApiProperty({ description: 'Phone number', example: '11999999999' })
  @IsOptional()
  @IsPhoneNumber('BR')
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'User mini bio', example: 'Mini Bio here' })
  @IsOptional()
  @IsString()
  biography?: string;

  @ApiProperty({ description: 'The user status', example: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({ description: 'is admin?', example: true })
  @IsOptional()
  @IsBoolean()
  is_master?: boolean;
}
