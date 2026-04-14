import { Injectable } from '@nestjs/common';
import { Package } from '../../../domain/shared/entities/package.entity';
import { IPackageRepository } from '../../../domain/shared/repositories/package.repository.interface';
import { PackageRow } from '../types/db.types';
import { BaseKnexRepository } from '../base.knex.repository';

@Injectable()
export class PackageKnexRepository extends BaseKnexRepository implements IPackageRepository {


  async findById(id: number): Promise<Package | null> {
    const row = await this.db<PackageRow>('package').where({ id }).first();
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Package[]> {
    const rows = await this.db<PackageRow>('package').select('*').orderBy('name');
    return rows.map(this.toDomain);
  }

  async findByName(name: string): Promise<Package | null> {
    const row = await this.db<PackageRow>('package').where({ name }).first();
    return row ? this.toDomain(row) : null;
  }

  async save(pkg: Package): Promise<void> {
    const payload: Record<string, unknown> = { name: pkg.name };
    if (pkg.id) payload.id = pkg.id;
    await this.db('package').insert(payload);
  }

  async update(pkg: Package): Promise<void> {
    await this.db('package').where({ id: pkg.id }).update({ name: pkg.name });
  }

  async delete(id: number): Promise<void> {
    await this.db('package').where({ id }).delete();
  }

  private toDomain(row: PackageRow): Package {
    return Package.create({ id: row.id, name: row.name });
  }
}
