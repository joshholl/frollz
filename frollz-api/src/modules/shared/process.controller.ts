import { Controller, Get } from '@nestjs/common';
import { ProcessService } from './application/process.service';

@Controller('processes')
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Get()
  findAll() {
    return this.processService.findAll();
  }
}
