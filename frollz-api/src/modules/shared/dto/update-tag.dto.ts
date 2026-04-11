import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  colorCode?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
