import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EmulsionService } from './application/emulsion.service';
import { CreateEmulsionDto } from './dto/create-emulsion.dto';
import { CreateEmulsionMultipleFormatsDto } from './dto/create-emulsion-multiple-formats.dto';
import { UpdateEmulsionDto } from './dto/update-emulsion.dto';

@Controller('emulsions')
export class EmulsionController {
  constructor(private readonly emulsionService: EmulsionService) {}

  @Get()
  findAll() {
    return this.emulsionService.findAll();
  }

  @Get('brands')
  findBrands(@Query('q') q?: string) {
    return this.emulsionService.findBrands(q);
  }

  @Get('manufacturers')
  findManufacturers(@Query('q') q?: string) {
    return this.emulsionService.findManufacturers(q);
  }

  @Get('speeds')
  findSpeeds(@Query('q') q?: string) {
    return this.emulsionService.findSpeeds(q);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.emulsionService.findById(id);
  }

  @Post()
  create(@Body() dto: CreateEmulsionDto) {
    return this.emulsionService.create(dto);
  }

  @Post('bulk')
  createMultipleFormats(@Body() dto: CreateEmulsionMultipleFormatsDto) {
    return this.emulsionService.createMultipleFormats(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmulsionDto) {
    return this.emulsionService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.emulsionService.delete(id);
  }

  @Post(':id/tags')
  @HttpCode(HttpStatus.NO_CONTENT)
  addTag(@Param('id') id: string, @Body('tagId') tagId: string) {
    return this.emulsionService.addTag(id, tagId);
  }

  @Delete(':id/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.emulsionService.removeTag(id, tagId);
  }
}
