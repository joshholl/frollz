import { Injectable } from '@nestjs/common';
import { Process } from '../../../domain/shared/entities/process.entity';
import { IProcessRepository } from '../../../domain/shared/repositories/process.repository.interface';
import { ProcessRow } from '../types/db.types';
import { BaseKnexRepository } from '../base.knex.repository';

@Injectable()
export class ProcessKnexRepository extends BaseKnexRepository implements IProcessRepository {

  async findById(id: number): Promise<Process | null> {
    const row = await this.db<ProcessRow>('process').where({ id }).first();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Process[]> {
    const rows = await this.db<ProcessRow>('process').select('*').orderBy('name');
    return rows.map(this.toDomain);
  }

  async findByName(name: string): Promise<Process | null> {
    const row = await this.db<ProcessRow>('process').where({ name }).first();
    return row ? this.toDomain(row) : null;
  }

  async save(process: Process): Promise<void> {
    await this.db('process').insert({ id: process.id, name: process.name });
  }

  async update(process: Process): Promise<void> {
    await this.db('process').where({ id: process.id }).update({ name: process.name });
  }

  async delete(id: number): Promise<void> {
    await this.db('process').where({ id }).delete();
  }

  private toDomain(row: ProcessRow): Process {
    return Process.create({ id: row.id, name: row.name });
  }
}
