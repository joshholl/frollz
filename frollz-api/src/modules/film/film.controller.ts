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
import { FilmService } from './application/film.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { TransitionFilmDto } from './dto/transition-film.dto';

@Controller('films')
export class FilmController {
  constructor(private readonly filmService: FilmService) {}

  @Get()
  findAll(@Query('state') state?: string | string[]) {
    const stateNames = state ? (Array.isArray(state) ? state : [state]) : undefined;
    return this.filmService.findAll(stateNames);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.filmService.findById(id);
  }

  @Get(':id/children')
  findChildren(@Param('id') id: string) {
    return this.filmService.findChildren(id);
  }

  @Post()
  create(@Body() dto: CreateFilmDto) {
    return this.filmService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFilmDto) {
    return this.filmService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this.filmService.delete(id);
  }

  @Post(':id/tags')
  @HttpCode(HttpStatus.NO_CONTENT)
  addTag(@Param('id') id: string, @Body('tagId') tagId: string) {
    return this.filmService.addTag(id, tagId);
  }

  @Delete(':id/tags/:tagId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeTag(@Param('id') id: string, @Param('tagId') tagId: string) {
    return this.filmService.removeTag(id, tagId);
  }

  @Post(':id/transition')
  transition(@Param('id') id: string, @Body() dto: TransitionFilmDto) {
    return this.filmService.transition(id, dto);
  }
}
