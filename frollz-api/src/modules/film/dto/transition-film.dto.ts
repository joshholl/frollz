import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TransitionFilmDto {
  @IsString()
  @IsNotEmpty()
  targetStateName: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
