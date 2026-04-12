import { Module } from '@nestjs/common';
import { KNEX_CONNECTION, KnexProvider } from './knex.provider';
import { MigrationRunnerService } from './migration-runner.service';

@Module({
  providers: [KnexProvider, MigrationRunnerService],
  exports: [KNEX_CONNECTION],
})
export class DatabaseModule {}
