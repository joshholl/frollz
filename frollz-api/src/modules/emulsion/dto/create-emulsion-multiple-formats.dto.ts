import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateEmulsionMultipleFormatsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  brand: string;

  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsNumber()
  @IsPositive()
  speed: number;

  @IsString()
  @IsNotEmpty()
  processId: string;

  @IsArray()
  @IsString({ each: true })
  formatIds: string[];

  @IsOptional()
  @IsString()
  parentId?: string;
}
