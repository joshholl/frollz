import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFilmDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  emulsionId?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;
}
