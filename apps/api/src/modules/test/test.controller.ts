import { Controller, Delete, Inject, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Public } from '../auth/public.decorator.js';

// User-owned tables in FK-safe deletion order (FK enforcement disabled during reset)
const USER_DATA_TABLES = [
  'frame_journey_event',
  'film_journey_event',
  'device_mount',
  'film_holder_slot',
  'film_frame',
  'film',
  'film_lot',
  'camera',
  'interchangeable_back',
  'film_holder',
  'film_device',
  'refresh_tokens',
  'idempotency_key',
];

@Controller('test')
export class TestController {
  constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) { }

  @Delete('reset')
  @Public()
  async reset(): Promise<{ data: { ok: boolean }; meta: Record<string, never> }> {
    if (process.env['NODE_ENV'] !== 'test') {
      throw new NotFoundException();
    }

    const conn = this.entityManager.getConnection();
    await conn.execute('PRAGMA foreign_keys = OFF');
    for (const table of USER_DATA_TABLES) {
      await conn.execute(`DELETE FROM \`${table}\``);
    }
    // Remove non-demo users; demo user (id=1) retains its row across scenarios
    await conn.execute('DELETE FROM `user` WHERE id != 1');
    await conn.execute('PRAGMA foreign_keys = ON');

    return { data: { ok: true }, meta: {} };
  }
}
