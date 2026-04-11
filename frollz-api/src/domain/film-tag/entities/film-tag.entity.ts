export class FilmTag {
  constructor(
    public readonly filmId: string,
    public readonly tagId: string,
  ) {}

  static create(props: { filmId: string; tagId: string }): FilmTag {
    return new FilmTag(props.filmId, props.tagId);
  }
}
