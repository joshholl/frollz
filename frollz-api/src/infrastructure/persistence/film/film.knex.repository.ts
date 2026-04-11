import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { Film } from '../../../domain/film/entities/film.entity';
import { IFilmRepository } from '../../../domain/film/repositories/film.repository.interface';
import { KNEX_CONNECTION } from '../knex.provider';
import { FilmRow, FilmTagRow, TagRow, FilmStateRow } from '../types/db.types';
import { FilmMapper } from './film.mapper';
import { Tag } from '../../../domain/shared/entities/tag.entity';
import { FilmState } from '../../../domain/film-state/entities/film-state.entity';

@Injectable()
export class FilmKnexRepository implements IFilmRepository {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async findById(id: string): Promise<Film | null> {
    const row = await this.knex<FilmRow>('film').where({ id }).first();
    return row ? this.hydrate(row) : null;
  }

  async findAll(): Promise<Film[]> {
    const rows = await this.knex<FilmRow>('film').select('*');
    return Promise.all(rows.map((row) => this.hydrate(row)));
  }

  async findByEmulsionId(emulsionId: string): Promise<Film[]> {
    const rows = await this.knex<FilmRow>('film').where({ emulsion_id: emulsionId });
    return Promise.all(rows.map((row) => this.hydrate(row)));
  }

  async findChildren(parentId: string): Promise<Film[]> {
    const rows = await this.knex<FilmRow>('film').where({ parent_id: parentId });
    return Promise.all(rows.map((row) => this.hydrate(row)));
  }

  async findByCurrentStateIds(stateIds: string[]): Promise<Film[]> {
    const latestStateSubquery = this.knex('film_state as fs2')
      .select('fs2.film_id')
      .whereIn('fs2.state_id', stateIds)
      .where(
        'fs2.date',
        this.knex('film_state as fs3').max('fs3.date').where('fs3.film_id', this.knex.ref('fs2.film_id')),
      );

    const rows = await this.knex<FilmRow>('film').whereIn('id', latestStateSubquery);
    return Promise.all(rows.map((row) => this.hydrate(row)));
  }

  async save(film: Film): Promise<void> {
    await this.knex('film').insert(FilmMapper.toPersistence(film));
  }

  async update(film: Film): Promise<void> {
    const { id, ...data } = FilmMapper.toPersistence(film);
    await this.knex('film').where({ id }).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.knex('film').where({ id }).delete();
  }

  private async hydrate(row: FilmRow): Promise<Film> {
    const film = FilmMapper.toDomain(row);
    const [tags, states] = await Promise.all([
      this.loadTags(row.id.trim()),
      this.loadStates(row.id.trim()),
    ]);
    return Film.create({ ...film, tags, states });
  }

  private async loadTags(filmId: string): Promise<Tag[]> {
    const rows = await this.knex<TagRow>('tag')
      .join<FilmTagRow>('film_tag', 'tag.id', 'film_tag.tag_id')
      .where('film_tag.film_id', filmId)
      .select('tag.*');
    return rows.map((r) =>
      Tag.create({
        id: r.id.trim(),
        name: r.name,
        colorCode: r.color_code.trim(),
        description: r.description,
      }),
    );
  }

  private async loadStates(filmId: string): Promise<FilmState[]> {
    const rows = await this.knex<FilmStateRow>('film_state')
      .where({ film_id: filmId })
      .orderBy('date', 'desc');
    return rows.map((r) =>
      FilmState.create({
        id: r.id.trim(),
        filmId: r.film_id.trim(),
        stateId: r.state_id.trim(),
        date: new Date(r.date),
        note: r.note,
      }),
    );
  }
}
