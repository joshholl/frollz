export const EMULSION_TAG_REPOSITORY = 'EMULSION_TAG_REPOSITORY';

export interface IEmulsionTagRepository {
  add(emulsionId: string, tagId: string): Promise<void>;
  remove(emulsionId: string, tagId: string): Promise<void>;
}
