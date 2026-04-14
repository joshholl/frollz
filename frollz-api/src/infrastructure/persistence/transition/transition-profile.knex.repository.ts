import { Injectable } from '@nestjs/common';
import { TransitionProfile } from '../../../domain/transition/entities/transition-profile.entity';
import { ITransitionProfileRepository } from '../../../domain/transition/repositories/transition-profile.repository.interface';
import { TransitionProfileRow } from '../types/db.types';
import { BaseKnexRepository } from '../base.knex.repository';

@Injectable()
export class TransitionProfileKnexRepository extends BaseKnexRepository implements ITransitionProfileRepository {


  async findById(id: number): Promise<TransitionProfile | null> {
    const row = await this.db<TransitionProfileRow>('transition_profile').where({ id }).first();
    return row ? TransitionProfile.create({ id: row.id, name: row.name }) : null;
  }

  async findAll(): Promise<TransitionProfile[]> {
    const rows = await this.db<TransitionProfileRow>('transition_profile').select('*').orderBy('name');
    return rows.map((r) => TransitionProfile.create({ id: r.id, name: r.name }));
  }

  async findByName(name: string): Promise<TransitionProfile | null> {
    const row = await this.db<TransitionProfileRow>('transition_profile').where({ name }).first();
    return row ? TransitionProfile.create({ id: row.id, name: row.name }) : null;
  }

  async save(profile: TransitionProfile): Promise<void> {
    await this.db('transition_profile').insert({ id: profile.id, name: profile.name });
  }

  async update(profile: TransitionProfile): Promise<void> {
    await this.db('transition_profile').where({ id: profile.id }).update({ name: profile.name });
  }

  async delete(id: number): Promise<void> {
    await this.db('transition_profile').where({ id }).delete();
  }
}
