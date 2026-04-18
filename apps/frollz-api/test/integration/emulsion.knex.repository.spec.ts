import { Knex } from 'knex';
import { createTestDb, seedSupporting } from './helpers/db';
import { EmulsionKnexRepository } from '../../src/infrastructure/persistence/emulsion/emulsion.knex.repository';
import { EmulsionTagKnexRepository } from '../../src/infrastructure/persistence/emulsion-tag/emulsion-tag.knex.repository';
import { Emulsion } from '../../src/domain/emulsion/entities/emulsion.entity';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: EmulsionKnexRepository;
let emulsionTagRepo: EmulsionTagKnexRepository;
let processId: number;
let formatId: number;
let tagId: number;

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new EmulsionKnexRepository(knex, txManager);
  emulsionTagRepo = new EmulsionTagKnexRepository(knex, txManager);
  const seeds = await seedSupporting(knex);
  processId = seeds.processId;
  formatId = seeds.formatId;
  tagId = seeds.tagId;
});

afterAll(async () => {
  await knex.destroy();
});

beforeEach(async () => {
  await knex('emulsion_tag').delete();
  await knex('emulsion').delete();
});

const makeEmulsion = (brand: string, overrides: Partial<Parameters<typeof Emulsion.create>[0]> = {}): Emulsion =>
  Emulsion.create({ brand, manufacturer: 'Kodak', speed: 400, processId, formatId, ...overrides });

describe('EmulsionKnexRepository', () => {
  describe('save / findById', () => {
    it('persists an emulsion and retrieves it by id', async () => {
      const id = await repo.save(makeEmulsion('Kodak Portra 400'));
      const emulsion = await repo.findById(id);

      expect(emulsion).not.toBeNull();
      expect(emulsion!.brand).toBe('Kodak Portra 400');
      expect(emulsion!.speed).toBe(400);
      expect(emulsion!.processId).toBe(processId);
      expect(emulsion!.formatId).toBe(formatId);
    });

    it('returns null for non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });

    it('sets parentId to null by default', async () => {
      const id = await repo.save(makeEmulsion('Kodak Ektar 100'));
      const emulsion = await repo.findById(id);

      expect(emulsion!.parentId).toBeNull();
    });

    it('persists parentId when set', async () => {
      const parentId = await repo.save(makeEmulsion('Ilford HP5'));
      const id = await repo.save(makeEmulsion('Ilford HP5 400T', { parentId }));
      const emulsion = await repo.findById(id);

      expect(emulsion!.parentId).toBe(parentId);
    });
  });

  describe('findAll', () => {
    it('returns all emulsions', async () => {
      await repo.save(makeEmulsion('Kodak Gold 200'));
      await repo.save(makeEmulsion('Fuji Superia 400'));

      const all = await repo.findAll();
      const brands = all.map((e) => e.brand);

      expect(brands).toContain('Kodak Gold 200');
      expect(brands).toContain('Fuji Superia 400');
    });

    it('returns empty array when no emulsions exist', async () => {
      await expect(repo.findAll()).resolves.toEqual([]);
    });
  });

  describe('findByBrand', () => {
    it('returns the emulsion for an exact brand match (case-insensitive)', async () => {
      await repo.save(makeEmulsion('Kodak Portra 400'));

      const found = await repo.findByBrand('Kodak Portra 400');
      expect(found).not.toBeNull();
      expect(found!.brand).toBe('Kodak Portra 400');
    });

    it('returns null when brand is not found', async () => {
      expect(await repo.findByBrand('NoSuchBrand')).toBeNull();
    });
  });

  describe('findByProcessId', () => {
    it('returns emulsions with matching processId', async () => {
      await repo.save(makeEmulsion('A'));
      await repo.save(makeEmulsion('B'));

      const found = await repo.findByProcessId(processId);
      expect(found.length).toBeGreaterThanOrEqual(2);
      expect(found.every((e) => e.processId === processId)).toBe(true);
    });

    it('returns empty array for unknown processId', async () => {
      expect(await repo.findByProcessId(99999)).toEqual([]);
    });
  });

  describe('findByFormatId', () => {
    it('returns emulsions with matching formatId', async () => {
      await repo.save(makeEmulsion('X'));

      const found = await repo.findByFormatId(formatId);
      expect(found.length).toBeGreaterThanOrEqual(1);
      expect(found.every((e) => e.formatId === formatId)).toBe(true);
    });

    it('returns empty array for unknown formatId', async () => {
      expect(await repo.findByFormatId(99999)).toEqual([]);
    });
  });

  describe('findBrands', () => {
    it('returns distinct brand names', async () => {
      await repo.save(makeEmulsion('Kodak Portra 400'));
      await repo.save(makeEmulsion('Kodak Portra 400')); // duplicate
      await repo.save(makeEmulsion('Ilford HP5'));

      const brands = await repo.findBrands();
      const kodakCount = brands.filter((b) => b === 'Kodak Portra 400').length;
      expect(kodakCount).toBe(1);
    });

    it('filters brands with a query string', async () => {
      await repo.save(makeEmulsion('Kodak Gold'));
      await repo.save(makeEmulsion('Fuji Velvia'));

      const brands = await repo.findBrands('Kod');
      expect(brands).toContain('Kodak Gold');
      expect(brands).not.toContain('Fuji Velvia');
    });
  });

  describe('findManufacturers', () => {
    it('returns distinct manufacturer names', async () => {
      await repo.save(makeEmulsion('A', { manufacturer: 'Kodak' }));
      await repo.save(makeEmulsion('B', { manufacturer: 'Kodak' }));
      await repo.save(makeEmulsion('C', { manufacturer: 'Ilford' }));

      const manufacturers = await repo.findManufacturers();
      const kodakCount = manufacturers.filter((m) => m === 'Kodak').length;
      expect(kodakCount).toBe(1);
      expect(manufacturers).toContain('Ilford');
    });
  });

  describe('findSpeeds', () => {
    it('returns distinct speed values ordered ascending', async () => {
      await repo.save(makeEmulsion('A', { speed: 100 }));
      await repo.save(makeEmulsion('B', { speed: 400 }));
      await repo.save(makeEmulsion('C', { speed: 100 })); // duplicate

      const speeds = await repo.findSpeeds();
      const count100 = speeds.filter((s) => s === 100).length;
      expect(count100).toBe(1);
      expect(speeds).toContain(400);
    });
  });

  describe('update', () => {
    it('updates emulsion fields', async () => {
      const id = await repo.save(makeEmulsion('Kodak Portra 400'));
      const emulsion = (await repo.findById(id))!;

      await repo.update(Emulsion.create({ ...emulsion, speed: 800 }));

      const updated = await repo.findById(id);
      expect(updated!.speed).toBe(800);
    });
  });

  describe('delete', () => {
    it('removes the emulsion', async () => {
      const id = await repo.save(makeEmulsion('ToDelete'));

      await repo.delete(id);

      expect(await repo.findById(id)).toBeNull();
    });

    it('does not throw when deleting non-existent id', async () => {
      await expect(repo.delete(99999)).resolves.toBeUndefined();
    });
  });

  describe('tag associations', () => {
    it('returns tags attached to an emulsion', async () => {
      const id = await repo.save(makeEmulsion('Tagged'));
      await emulsionTagRepo.add(id, tagId);

      const emulsion = await repo.findById(id);
      expect(emulsion!.tags).toHaveLength(1);
      expect(emulsion!.tags[0].id).toBe(tagId);
    });

    it('returns empty tags array when no tags are attached', async () => {
      const id = await repo.save(makeEmulsion('Untagged'));
      const emulsion = await repo.findById(id);

      expect(emulsion!.tags).toEqual([]);
    });
  });

  describe('box image', () => {
    it('stores and retrieves a box image', async () => {
      const id = await repo.save(makeEmulsion('WithImage'));
      const imageData = Buffer.from('fake-jpeg-bytes');
      await repo.updateBoxImage(id, imageData, 'image/jpeg');

      const result = await repo.getBoxImage(id);
      expect(result).not.toBeNull();
      expect(result!.mimeType).toBe('image/jpeg');
      expect(Buffer.compare(result!.data, imageData)).toBe(0);
    });

    it('returns null when no box image has been set', async () => {
      const id = await repo.save(makeEmulsion('NoImage'));
      expect(await repo.getBoxImage(id)).toBeNull();
    });
  });
});
