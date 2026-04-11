import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CreateFormatDto } from './dto/create-format.dto';
import { UpdateFormatDto } from './dto/update-format.dto';
import { FormatService } from './application/format.service';

@Controller('formats')
export class FormatController {
  constructor(private readonly formatService: FormatService) {}

  @Get()
  findAll() {
    return this.formatService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.formatService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateFormatDto) {
    return this.formatService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFormatDto) {
    return this.formatService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.formatService.delete(id);
  }
}
