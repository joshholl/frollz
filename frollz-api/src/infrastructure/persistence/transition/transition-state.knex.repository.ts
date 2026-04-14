import { Injectable } from '@nestjs/common';
import { TransitionState } from '../../../domain/transition/entities/transition-state.entity';
import { TransitionStateMetadata } from '../../../domain/transition/entities/transition-state-metadata.entity';
import { ITransitionStateRepository } from '../../../domain/transition/repositories/transition-state.repository.interface';
import { TransitionStateRow, TransitionStateMetadataRow } from '../types/db.types';
import { BaseKnexRepository } from '../base.knex.repository';

@Injectable()
export class TransitionStateKnexRepository extends BaseKnexRepository implements ITransitionStateRepository {


  async findById(id: number): Promise<TransitionState | null> {
    const row = await this.db<TransitionStateRow>('transition_state').where({ id }).first();
    if (!row) return null;
    const metadata = await this.loadMetadata(id);
    return TransitionState.create({ id: row.id, name: row.name, metadata });
  }

  async findAll(): Promise<TransitionState[]> {
    const rows = await this.db<TransitionStateRow>('transition_state').select('*').orderBy('name');
    return Promise.all(
      rows.map(async (row) => {
        const metadata = await this.loadMetadata(row.id);
        return TransitionState.create({ id: row.id, name: row.name, metadata });
      }),
    );
  }

  async findByName(name: string): Promise<TransitionState | null> {
    const row = await this.db<TransitionStateRow>('transition_state').where({ name }).first();
    if (!row) return null;
    const metadata = await this.loadMetadata(row.id);
    return TransitionState.create({ id: row.id, name: row.name, metadata });
  }

  async save(state: TransitionState): Promise<void> {
    await this.db('transition_state').insert({ id: state.id, name: state.name });
  }

  async update(state: TransitionState): Promise<void> {
    await this.db('transition_state').where({ id: state.id }).update({ name: state.name });
  }

  async delete(id: number): Promise<void> {
    await this.db('transition_state').where({ id }).delete();
  }

  private async loadMetadata(transitionStateId: number): Promise<TransitionStateMetadata[]> {
    const rows = await this.db<TransitionStateMetadataRow>('transition_state_metadata').where({
      transition_state_id: transitionStateId,
    });
    return rows.map((r) =>
      TransitionStateMetadata.create({
        id: r.id,
        fieldId: r.field_id,
        transitionStateId: r.transition_state_id,
        defaultValue: r.default_value,
      }),
    );
  }
}
