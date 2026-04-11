import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Knex } from 'knex';
import { KNEX_CONNECTION } from './knex.provider';

@Injectable()
export class MigrationRunnerService implements OnModuleInit {
  private readonly logger = new Logger(MigrationRunnerService.name);

  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('Running database migrations…');
    const [batch, migrations] = await this.knex.migrate.latest({
      directory: './migrations',
    });
    if (migrations.length === 0) {
      this.logger.log('No pending migrations.');
    } else {
      this.logger.log(`Batch ${batch} applied: ${migrations.join(', ')}`);
    }
  }
}
