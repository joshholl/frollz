import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateEmulsionDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  brand?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  manufacturer?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  speed?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  processId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  formatId?: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
