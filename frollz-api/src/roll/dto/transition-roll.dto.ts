import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { RollState } from "../entities/roll.entity";

export class TransitionRollDto {
  @ApiProperty({ enum: RollState })
  @IsEnum(RollState)
  targetState: RollState;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
