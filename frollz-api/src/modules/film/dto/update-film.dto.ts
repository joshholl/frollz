import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFilmDto {
  @ApiPropertyOptional({ example: 'Roll 001' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ description: 'ID of the emulsion', example: 'uuid' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  emulsionId?: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
