import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateEmulsionMultipleFormatsDto {
  @ApiProperty({ example: 'HP5 Plus' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Ilford' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: 'Harman Technology' })
  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @ApiProperty({ example: 400 })
  @IsNumber()
  @IsPositive()
  speed: number;

  @ApiProperty({ description: 'ID of the process', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  processId: string;

  @ApiProperty({ description: 'One emulsion will be created per format ID', example: ['uuid-35mm', 'uuid-120'] })
  @IsArray()
  @IsString({ each: true })
  formatIds: string[];

  @ApiPropertyOptional({ description: 'ID of the base emulsion', example: 'uuid' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
