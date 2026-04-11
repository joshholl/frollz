import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateEmulsionDto {
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

  @IsString()
  @IsNotEmpty()
  formatId: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
