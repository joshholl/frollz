import { Knex } from 'knex';
import { createTestDb, seedSupporting } from './helpers/db';
import { FormatKnexRepository } from '../../src/infrastructure/persistence/shared/format.knex.repository';
import { Format } from '../../src/domain/shared/entities/format.entity';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: FormatKnexRepository;
let packageId: number;

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new FormatKnexRepository(knex, txManager);
  const seeds = await seedSupporting(knex);
  packageId = seeds.packageId;
});

afterAll(async () => {
  await knex.destroy();
});

beforeEach(async () => {
  // Delete formats inserted by tests; leave seed format intact by tracking via packageId.
  await knex('format').where({ package_id: packageId }).delete();
});

const insert = async (name: string, pkgId = packageId): Promise<Format> => {
  const id = await repo.save(Format.create({ packageId: pkgId, name }));
  return (await repo.findById(id))!;
};

describe('FormatKnexRepository', () => {
  describe('save / findById', () => {
    it('persists a format and retrieves it by id', async () => {
      const id = await repo.save(Format.create({ packageId, name: '35mm' }));
      const format = await repo.findById(id);

      expect(format).not.toBeNull();
      expect(format!.name).toBe('35mm');
      expect(format!.packageId).toBe(packageId);
    });

    it('returns null for a non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all formats ordered by name', async () => {
      await insert('120');
      await insert('35mm');
      await insert('4x5');

      const formats = await repo.findAll();
      const names = formats.map((f) => f.name);

      // All three should appear (there may be others from migrations/seeds)
      expect(names).toContain('120');
      expect(names).toContain('35mm');
      expect(names).toContain('4x5');
      expect(names.indexOf('120')).toBeLessThan(names.indexOf('35mm'));
      expect(names.indexOf('35mm')).toBeLessThan(names.indexOf('4x5'));
    });
  });

  describe('findByPackageId', () => {
    it('returns formats for the given package', async () => {
      await insert('35mm');
      await insert('120');

      const formats = await repo.findByPackageId(packageId);
      const names = formats.map((f) => f.name);

      expect(names).toContain('35mm');
      expect(names).toContain('120');
    });

    it('returns empty array when package has no formats', async () => {
      const [emptyPkgId] = await knex('package').insert({ name: 'EmptyPkg' });
      const formats = await repo.findByPackageId(emptyPkgId);
      expect(formats).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates the format name', async () => {
      const format = await insert('OldName');

      await repo.update(Format.create({ id: format.id, packageId, name: 'NewName' }));

      const updated = await repo.findById(format.id);
      expect(updated!.name).toBe('NewName');
    });

    it('updates the packageId', async () => {
      const format = await insert('35mm');
      const [newPkgId] = await knex('package').insert({ name: 'NewPkg' });

      await repo.update(Format.create({ id: format.id, packageId: newPkgId, name: '35mm' }));

      const updated = await repo.findById(format.id);
      expect(updated!.packageId).toBe(newPkgId);
    });
  });

  describe('delete', () => {
    it('removes the format', async () => {
      const format = await insert('ToDelete');

      await repo.delete(format.id);

      expect(await repo.findById(format.id)).toBeNull();
    });

    it('does not throw when deleting a non-existent id', async () => {
      await expect(repo.delete(99999)).resolves.toBeUndefined();
    });

    it('only deletes the targeted format', async () => {
      const keep = await insert('Keep');
      const remove = await insert('Remove');

      await repo.delete(remove.id);

      expect(await repo.findById(keep.id)).not.toBeNull();
      expect(await repo.findById(remove.id)).toBeNull();
    });
  });
});
