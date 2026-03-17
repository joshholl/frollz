import { Module } from "@nestjs/common";
import { RollStateService } from "./roll-state.service";
import { RollStateController } from "./roll-state.controller";

@Module({
  controllers: [RollStateController],
  providers: [RollStateService],
  exports: [RollStateService],
})
export class RollStateModule {}
