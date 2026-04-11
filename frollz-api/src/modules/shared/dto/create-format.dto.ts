import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFormatDto {
  @IsString()
  @IsNotEmpty()
  packageId: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
