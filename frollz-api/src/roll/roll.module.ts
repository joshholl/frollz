import { Module } from "@nestjs/common";
import { RollService } from "./roll.service";
import { RollController } from "./roll.controller";
import { RollStateModule } from "../roll-state/roll-state.module";

@Module({
  imports: [RollStateModule],
  controllers: [RollController],
  providers: [RollService],
  exports: [RollService],
})
export class RollModule {}
