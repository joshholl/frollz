import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateEmulsionDto {
  @ApiPropertyOptional({ example: 'Portra 400' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Kodak' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  brand?: string;

  @ApiPropertyOptional({ example: 'Kodak Alaris' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  manufacturer?: string;

  @ApiPropertyOptional({ example: 400 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  speed?: number;

  @ApiPropertyOptional({ description: 'ID of the process', example: 'uuid' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  processId?: string;

  @ApiPropertyOptional({ description: 'ID of the format', example: 'uuid' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  formatId?: string;

  @ApiPropertyOptional({ description: 'ID of the base emulsion', example: 'uuid' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
