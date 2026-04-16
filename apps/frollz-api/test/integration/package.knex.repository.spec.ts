import { Knex } from 'knex';
import { createTestDb } from './helpers/db';
import { PackageKnexRepository } from '../../src/infrastructure/persistence/shared/package.knex.repository';
import { Package } from '../../src/domain/shared/entities/package.entity';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: PackageKnexRepository;

// Migration seeds packages into package_default only; package table starts empty for test data.
beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new PackageKnexRepository(knex, txManager);
});

afterAll(async () => {
  await knex.destroy();
});

beforeEach(async () => {
  // Clear only the user-created packages (leave package_default rows untouched).
  // Migration seeds don't insert into 'package'; seeds/001-package.ts does,
  // but we don't run seeds in test. So the table is empty after each test.
  await knex('package').delete();
});

const insert = async (name: string): Promise<Package> => {
  const pkg = Package.create({ id: 0, name });
  await repo.save(pkg);
  const row = await knex('package').where({ name }).first();
  return Package.create({ id: row.id, name: row.name });
};

describe('PackageKnexRepository', () => {
  describe('save / findById', () => {
    it('persists a package and retrieves it by id', async () => {
      const pkg = await insert('Roll');

      const found = await repo.findById(pkg.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe('Roll');
    });

    it('returns null for a non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all packages ordered by name', async () => {
      await insert('Sheet');
      await insert('Roll');

      const pkgs = await repo.findAll();
      const names = pkgs.map((p) => p.name);

      expect(names).toContain('Roll');
      expect(names).toContain('Sheet');
      expect(names.indexOf('Roll')).toBeLessThan(names.indexOf('Sheet'));
    });

    it('returns empty array when table is empty', async () => {
      await expect(repo.findAll()).resolves.toEqual([]);
    });
  });

  describe('findByName', () => {
    it('returns the package when found by exact name', async () => {
      await insert('Roll');

      const pkg = await repo.findByName('Roll');
      expect(pkg).not.toBeNull();
      expect(pkg!.name).toBe('Roll');
    });

    it('returns null for unknown name', async () => {
      expect(await repo.findByName('NoSuch')).toBeNull();
    });
  });

  describe('update', () => {
    it('updates the package name', async () => {
      const pkg = await insert('OldName');

      await repo.update(Package.create({ id: pkg.id, name: 'NewName' }));

      const updated = await repo.findById(pkg.id);
      expect(updated!.name).toBe('NewName');
    });
  });

  describe('delete', () => {
    it('removes the package', async () => {
      const pkg = await insert('ToDelete');

      await repo.delete(pkg.id);

      expect(await repo.findById(pkg.id)).toBeNull();
    });

    it('does not throw when deleting non-existent id', async () => {
      await expect(repo.delete(99999)).resolves.toBeUndefined();
    });
  });
});
