import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFormatDto {
  @ApiPropertyOptional({ description: 'ID of the parent package', example: 'uuid' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  packageId?: string;

  @ApiPropertyOptional({ example: '35mm' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
