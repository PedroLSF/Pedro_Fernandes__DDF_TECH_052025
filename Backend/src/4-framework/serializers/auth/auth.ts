import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InputAuth {
  @ApiProperty({ description: 'Email', example: 'userEmail@example.com' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ description: 'Email', example: 'userEmail@example.com' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
