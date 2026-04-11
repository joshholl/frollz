export const FILM_TAG_REPOSITORY = 'FILM_TAG_REPOSITORY';

export interface IFilmTagRepository {
  add(filmId: string, tagId: string): Promise<void>;
  remove(filmId: string, tagId: string): Promise<void>;
}
