import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFilmDto {
  @ApiProperty({ example: 'Roll 001' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'ID of the emulsion loaded in this film', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  emulsionId: string;

  @ApiProperty({ example: '2026-12-31' })
  @IsDateString()
  expirationDate: string;

  @ApiPropertyOptional({ description: 'ID of the parent bulk canister', example: 'uuid' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
