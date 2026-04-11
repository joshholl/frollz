import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFormatDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  packageId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
