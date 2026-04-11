import { Controller, Get, Query } from '@nestjs/common';
import { FilmStateService } from './application/film-state.service';

@Controller('film-states')
export class FilmStateController {
  constructor(private readonly filmStateService: FilmStateService) {}

  @Get()
  findByFilmId(@Query('filmId') filmId: string) {
    return this.filmStateService.findByFilmId(filmId);
  }
}
