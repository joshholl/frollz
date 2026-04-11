import { Controller, Get, Query } from '@nestjs/common';
import { TransitionService } from './application/transition.service';

@Controller('transitions')
export class TransitionController {
  constructor(private readonly transitionService: TransitionService) {}

  @Get()
  getGraph(@Query('profile') profile?: string) {
    return this.transitionService.getGraph(profile);
  }
}
