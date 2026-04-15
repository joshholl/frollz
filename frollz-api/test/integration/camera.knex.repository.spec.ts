import { Knex } from 'knex';
import { createTestDb, seedSupporting } from './helpers/db';
import { CameraKnexRepository } from '../../src/infrastructure/persistence/camera/camera.knex.repository';
import { Camera } from '../../src/domain/camera/entities/camera.entity';
import { TransactionManager } from '../../src/common/utils/transaction-manager';
import { AppLogger } from '../../src/common/utils/app-logger';

let knex: Knex;
let repo: CameraKnexRepository;
let formatId: number;

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new CameraKnexRepository(knex, txManager);
  const seeds = await seedSupporting(knex);
  formatId = seeds.formatId;
});

afterAll(async () => {
  await knex.destroy();
});

beforeEach(async () => {
  await knex('camera_accepted_format').delete();
  await knex('camera').delete();
});

const makeCamera = (brand: string, model = 'Test Model', status: Camera['status'] = 'active'): Camera =>
  Camera.create({ brand, model, status });

describe('CameraKnexRepository', () => {
  describe('save / findById', () => {
    it('persists a camera and retrieves it by id', async () => {

      const id = await repo.save(makeCamera('Canon'));
      const camera = await repo.findById(id);

      expect(camera).not.toBeNull();
      expect(camera!.brand).toBe('Canon');
      expect(camera!.model).toBe('Test Model');
      expect(camera!.status).toBe('active');
    });

    it('returns null for non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });

    it('persists optional fields', async () => {
      const id = await repo.save(Camera.create({
        brand: 'Nikon',
        model: 'FM2',
        status: 'active',
        serialNumber: 'SN-001',
        purchasePrice: 250.5,
        acquiredAt: new Date('2022-03-15'),
      }));
      const camera = await repo.findById(id);

      expect(camera!.serialNumber).toBe('SN-001');
      expect(camera!.purchasePrice).toBe(250.5);
    });
  });

  describe('save with accepted formats', () => {
    it('records accepted format associations', async () => {
      const id = await repo.save(makeCamera('Pentax'), [formatId]);
      const camera = await repo.findById(id);

      expect(camera!.acceptedFormats).toHaveLength(1);
      expect(camera!.acceptedFormats[0].formatId).toBe(formatId);
    });

    it('throws when a referenced format does not exist', async () => {
      await expect(repo.save(makeCamera('Leica'), [99999])).rejects.toThrow();
    });

    it('saves camera with no formats when formatIds is empty', async () => {
      const id = await repo.save(makeCamera('Olympus'), []);
      const camera = await repo.findById(id);

      expect(camera!.acceptedFormats).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('returns all cameras', async () => {
      await repo.save(makeCamera('Canon'));
      await repo.save(makeCamera('Nikon'));

      const cameras = await repo.findAll({});
      const brands = cameras.map((c) => c.brand);

      expect(brands).toContain('Canon');
      expect(brands).toContain('Nikon');
    });

    it('returns empty array when no cameras exist', async () => {
      await expect(repo.findAll({})).resolves.toEqual([]);
    });

    it('filters by brand (case-insensitive partial match)', async () => {
      await repo.save(makeCamera('Canon EOS'));
      await repo.save(makeCamera('Nikon FM'));

      const result = await repo.findAll({ brand: 'canon' });
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every((c) => c.brand.toLowerCase().includes('canon'))).toBe(true);
    });

    it('filters by model (case-insensitive partial match)', async () => {
      await repo.save(Camera.create({ brand: 'Canon', model: 'AE-1 Program', status: 'active' }));
      await repo.save(Camera.create({ brand: 'Nikon', model: 'FM3a', status: 'active' }));

      const result = await repo.findAll({ model: 'AE-1' });
      expect(result.every((c) => c.model.toLowerCase().includes('ae-1'))).toBe(true);
    });

    it('filters by status', async () => {
      await repo.save(Camera.create({ brand: 'A', model: 'M1', status: 'active' }));
      await repo.save(Camera.create({ brand: 'B', model: 'M2', status: 'retired' }));

      const active = await repo.findAll({ status: 'active' });
      expect(active.every((c) => c.status === 'active')).toBe(true);
    });

    it('filters by formatId', async () => {
      await repo.save(makeCamera('WithFormat'), [formatId]);
      await repo.save(makeCamera('WithoutFormat'));

      const result = await repo.findAll({ formatId });
      expect(result.every((c) => c.acceptedFormats.some((f) => f.formatId === formatId))).toBe(true);
    });

    it('throws when unloaded filter is used (not yet implemented)', async () => {
      await expect(repo.findAll({ unloaded: true })).rejects.toThrow('not implemented');
    });
  });

  describe('update', () => {
    it('updates camera fields', async () => {
      const id = await repo.save(makeCamera('OldBrand'));
      const existing = (await repo.findById(id))!;

      await repo.update(Camera.create({ ...existing, brand: 'NewBrand', status: 'retired' }));

      const updated = await repo.findById(id);
      expect(updated!.brand).toBe('NewBrand');
      expect(updated!.status).toBe('retired');
    });
  });

  describe('delete', () => {
    it('removes the camera', async () => {
      const id = await repo.save(makeCamera('ToDelete'));

      await repo.delete(id);

      expect(await repo.findById(id)).toBeNull();
    });

    it('does not throw when deleting non-existent id', async () => {
      await expect(repo.delete(99999)).resolves.toBeUndefined();
    });

    it('cascades deletion of accepted format associations', async () => {
      const id = await repo.save(makeCamera('WithFormats'), [formatId]);

      await repo.delete(id);

      const assocs = await knex('camera_accepted_format').where({ camera_id: id });
      expect(assocs).toHaveLength(0);
    });
  });
});
