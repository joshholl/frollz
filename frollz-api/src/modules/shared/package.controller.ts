import { Controller, Get } from '@nestjs/common';
import { PackageService } from './application/package.service';

@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Get()
  findAll() {
    return this.packageService.findAll();
  }
}
