import { Knex } from 'knex';
import { createTestDb } from './helpers/db';
import { ProcessKnexRepository } from '../../src/infrastructure/persistence/shared/process.knex.repository';
import { Process } from '../../src/domain/shared/entities/process.entity';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: ProcessKnexRepository;

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new ProcessKnexRepository(knex, txManager);
});

afterAll(async () => {
  await knex.destroy();
});

beforeEach(async () => {
  await knex('process').delete();
});

const insert = async (name: string): Promise<Process> => {
  const p = Process.create({ id: 0, name });
  await repo.save(p);
  const row = await knex('process').where({ name }).first();
  return Process.create({ id: row.id, name: row.name });
};

describe('ProcessKnexRepository', () => {
  describe('save / findById', () => {
    it('persists a process and retrieves it by id', async () => {
      const proc = await insert('C-41');

      const found = await repo.findById(proc.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe('C-41');
    });

    it('returns null for a non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all processes ordered by name', async () => {
      await insert('E-6');
      await insert('B&W');
      await insert('C-41');

      const procs = await repo.findAll();
      const names = procs.map((p) => p.name);

      expect(names).toEqual(['B&W', 'C-41', 'E-6']);
    });

    it('returns empty array when table is empty', async () => {
      await expect(repo.findAll()).resolves.toEqual([]);
    });
  });

  describe('findByName', () => {
    it('returns the process when found', async () => {
      await insert('C-41');

      const proc = await repo.findByName('C-41');
      expect(proc).not.toBeNull();
      expect(proc!.name).toBe('C-41');
    });

    it('returns null for unknown name', async () => {
      expect(await repo.findByName('Unknown')).toBeNull();
    });
  });

  describe('update', () => {
    it('updates the process name', async () => {
      const proc = await insert('Old');

      await repo.update(Process.create({ id: proc.id, name: 'New' }));

      const updated = await repo.findById(proc.id);
      expect(updated!.name).toBe('New');
    });
  });

  describe('delete', () => {
    it('removes the process', async () => {
      const proc = await insert('ToDelete');

      await repo.delete(proc.id);

      expect(await repo.findById(proc.id)).toBeNull();
    });

    it('does not throw when deleting non-existent id', async () => {
      await expect(repo.delete(99999)).resolves.toBeUndefined();
    });
  });
});
