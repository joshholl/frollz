import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFilmDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  emulsionId: string;

  @IsDateString()
  expirationDate: string;

  @IsOptional()
  @IsString()
  parentId?: string;
}
