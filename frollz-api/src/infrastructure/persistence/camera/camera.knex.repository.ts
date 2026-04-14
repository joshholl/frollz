import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from '../knex.provider';

import { ICameraRepository } from '../../../domain/camera/repositories/camera.repository.interface';
import { Camera, CameraStatus } from '../../../domain/camera/entities/camera.entity';
import { CameraMapper } from './camera.mapper';


@Injectable()
export class CameraKnexRepository implements ICameraRepository {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) { }
  findById(id: number): Promise<Camera | null> {
    const row = this.knex.select('*').from('camera').where({ id }).first();
    return row.then(r => r ? CameraMapper.toDomain(r) : null);
  }

  async findAll(criteria: { brand?: string; model?: string; status?: CameraStatus; formatId?: number; unloaded?: boolean; }): Promise<Camera[]> {
    let query = this.knex.select('*').from('camera');
    if (criteria.brand) {
      query = query.whereILike('brand', `%${criteria.brand}%`);
    }
    if (criteria.model) {
      query = query.whereILike('model', `%${criteria.model}%`);
    }
    if (criteria.status) {
      query = query.where('status', criteria.status);
    }
    if (criteria.formatId) {
      query = query
        .join('camera_accepted_formats as caf', 'camera.id', 'caf.camera_id')
        .where('caf.format_id', criteria.formatId);
    }
    if (criteria.unloaded) {
      throw new Error('Unloaded filter not implemented yet');
    }
    const rows = await query;
    return rows.map(CameraMapper.toDomain);
  }


  async save(camera: Camera): Promise<number> {
    const row = CameraMapper.toPersistence(camera);
    const [id] = await this.knex('camera').insert(row).returning('id')
    return id;
  }
  async update(camera: Camera): Promise<void> {
    const row = CameraMapper.toPersistence(camera);
    await this.knex('camera').where({ id: camera.id }).update(row);
    await this.knex('camera').where({ id: camera.id })
  }
  async delete(id: number): Promise<void> {
    await this.knex('camera').where({ id }).delete();
  }
}
