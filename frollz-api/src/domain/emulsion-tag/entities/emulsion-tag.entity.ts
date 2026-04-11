export class EmulsionTag {
  constructor(
    public readonly emulsionId: string,
    public readonly tagId: string,
  ) {}

  static create(props: { emulsionId: string; tagId: string }): EmulsionTag {
    return new EmulsionTag(props.emulsionId, props.tagId);
  }
}
