import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFormatDto {
  @ApiProperty({ description: 'ID of the parent package (e.g. Roll, Sheet, Instant)', example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  packageId: string;

  @ApiProperty({ example: '35mm' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
