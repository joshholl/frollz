import { Injectable } from '@nestjs/common';
import { TransitionMetadataField } from '../../../domain/transition/entities/transition-metadata-field.entity';
import { ITransitionMetadataFieldRepository } from '../../../domain/transition/repositories/transition-metadata-field.repository.interface';
import { TransitionMetadataFieldRow } from '../types/db.types';
import { BaseKnexRepository } from '../base.knex.repository';

@Injectable()
export class TransitionMetadataFieldKnexRepository extends BaseKnexRepository implements ITransitionMetadataFieldRepository {


  async findById(id: number): Promise<TransitionMetadataField | null> {
    const row = await this.db<TransitionMetadataFieldRow>('transition_metadata_field').where({ id }).first();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<TransitionMetadataField[]> {
    const rows = await this.db<TransitionMetadataFieldRow>('transition_metadata_field').select('*').orderBy('name');
    return rows.map(this.toDomain);
  }

  async findByName(name: string): Promise<TransitionMetadataField | null> {
    const row = await this.db<TransitionMetadataFieldRow>('transition_metadata_field').where({ name }).first();
    return row ? this.toDomain(row) : null;
  }

  async save(field: TransitionMetadataField): Promise<void> {
    await this.db('transition_metadata_field').insert({
      id: field.id,
      name: field.name,
      field_type: field.fieldType,
      allow_multiple: field.allowMultiple,
    });
  }

  async update(field: TransitionMetadataField): Promise<void> {
    await this.db('transition_metadata_field').where({ id: field.id }).update({
      name: field.name,
      field_type: field.fieldType,
      allow_multiple: field.allowMultiple,
    });
  }

  async delete(id: number): Promise<void> {
    await this.db('transition_metadata_field').where({ id }).delete();
  }

  private toDomain(row: TransitionMetadataFieldRow): TransitionMetadataField {
    return TransitionMetadataField.create({
      id: row.id,
      name: row.name,
      fieldType: row.field_type,
      allowMultiple: Boolean(row.allow_multiple),
    });
  }
}
