import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/persistence/database.module';
import { FILM_REPOSITORY } from '../../domain/film/repositories/film.repository.interface';
import { FILM_TAG_REPOSITORY } from '../../domain/film-tag/repositories/film-tag.repository.interface';
import { FILM_STATE_REPOSITORY } from '../../domain/film-state/repositories/film-state.repository.interface';
import { TRANSITION_STATE_REPOSITORY } from '../../domain/transition/repositories/transition-state.repository.interface';
import { TRANSITION_RULE_REPOSITORY } from '../../domain/transition/repositories/transition-rule.repository.interface';
import { FilmKnexRepository } from '../../infrastructure/persistence/film/film.knex.repository';
import { FilmTagKnexRepository } from '../../infrastructure/persistence/film-tag/film-tag.knex.repository';
import { FilmStateKnexRepository } from '../../infrastructure/persistence/film-state/film-state.knex.repository';
import { TransitionStateKnexRepository } from '../../infrastructure/persistence/transition/transition-state.knex.repository';
import { TransitionRuleKnexRepository } from '../../infrastructure/persistence/transition/transition-rule.knex.repository';
import { FilmService } from './application/film.service';
import { FilmController } from './film.controller';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: FILM_REPOSITORY, useClass: FilmKnexRepository },
    { provide: FILM_TAG_REPOSITORY, useClass: FilmTagKnexRepository },
    { provide: FILM_STATE_REPOSITORY, useClass: FilmStateKnexRepository },
    { provide: TRANSITION_STATE_REPOSITORY, useClass: TransitionStateKnexRepository },
    { provide: TRANSITION_RULE_REPOSITORY, useClass: TransitionRuleKnexRepository },
    FilmService,
  ],
  controllers: [FilmController],
  exports: [FILM_REPOSITORY],
})
export class FilmModule {}
