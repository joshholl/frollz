import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IFilmTagRepository } from '../../../domain/film-tag/repositories/film-tag.repository.interface';
import { KNEX_CONNECTION } from '../knex.provider';
import { randomUUID } from 'crypto';

@Injectable()
export class FilmTagKnexRepository implements IFilmTagRepository {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async add(filmId: string, tagId: string): Promise<void> {
    await this.knex('film_tag').insert({ id: randomUUID(), film_id: filmId, tag_id: tagId });
  }

  async remove(filmId: string, tagId: string): Promise<void> {
    await this.knex('film_tag').where({ film_id: filmId, tag_id: tagId }).delete();
  }
}
