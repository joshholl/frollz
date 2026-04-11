import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IEmulsionTagRepository } from '../../../domain/emulsion-tag/repositories/emulsion-tag.repository.interface';
import { KNEX_CONNECTION } from '../knex.provider';
import { randomUUID } from 'crypto';

@Injectable()
export class EmulsionTagKnexRepository implements IEmulsionTagRepository {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async add(emulsionId: string, tagId: string): Promise<void> {
    await this.knex('emulsion_tag').insert({ id: randomUUID(), emulsion_id: emulsionId, tag_id: tagId });
  }

  async remove(emulsionId: string, tagId: string): Promise<void> {
    await this.knex('emulsion_tag').where({ emulsion_id: emulsionId, tag_id: tagId }).delete();
  }
}
