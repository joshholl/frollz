import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TransitionService } from './application/transition.service';

@ApiTags('Transitions')
@Controller('transitions')
export class TransitionController {
  constructor(private readonly transitionService: TransitionService) {}

  @Get()
  @ApiOperation({ summary: 'Get the state machine graph for a transition profile' })
  @ApiQuery({ name: 'profile', required: false, example: 'standard' })
  getGraph(@Query('profile') profile?: string) {
    return this.transitionService.getGraph(profile);
  }
}
