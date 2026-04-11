import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateEmulsionDto {
  @ApiProperty({ example: 'Portra 400' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Kodak' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Kodak Alaris' })
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @ApiProperty({ example: 400 })
  @IsNumber()
  @IsPositive()
  speed: number;

  @ApiProperty({ description: 'ID of the process (e.g. C-41, E-6)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  processId: string;

  @ApiProperty({ description: 'ID of the format (e.g. 35mm, 120)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  formatId: string;

  @ApiPropertyOptional({ description: 'ID of the base emulsion this is derived from', example: 'uuid' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
