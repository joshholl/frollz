import { Knex } from 'knex';
import { createTestDb, stateId } from './helpers/db';
import { TransitionStateMetadataKnexRepository } from '../../src/infrastructure/persistence/transition/transition-state-metadata.knex.repository';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: TransitionStateMetadataKnexRepository;
let frozenId: number;
let sentForDevId: number;

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new TransitionStateMetadataKnexRepository(knex, txManager);

  frozenId = await stateId(knex, 'Frozen');
  sentForDevId = await stateId(knex, 'Sent For Development');
});

afterAll(async () => {
  await knex.destroy();
});

describe('TransitionStateMetadataKnexRepository', () => {
  describe('findAll', () => {
    it('returns all seeded metadata associations', async () => {
      const all = await repo.findAll();
      expect(all.length).toBeGreaterThan(0);
    });
  });

  describe('findById', () => {
    it('returns a metadata record when found', async () => {
      const all = await repo.findAll();
      const first = all[0];

      const found = await repo.findById(first.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(first.id);
    });

    it('returns null for non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });
  });

  describe('findByTransitionStateId', () => {
    it('returns all metadata for the Frozen state', async () => {
      const metadata = await repo.findByTransitionStateId(frozenId);

      // Frozen has 'temperature' field from migration seed
      expect(metadata.length).toBeGreaterThan(0);
      expect(metadata.every((m) => m.transitionStateId === frozenId)).toBe(true);
    });

    it('returns multiple fields for Sent For Development', async () => {
      const metadata = await repo.findByTransitionStateId(sentForDevId);

      // labName, deliveryMethod, processRequested, pushPullStops
      expect(metadata.length).toBeGreaterThanOrEqual(4);
    });

    it('returns empty array for a state with no metadata', async () => {
      const loadedId = await stateId(knex, 'Loaded');
      expect(await repo.findByTransitionStateId(loadedId)).toEqual([]);
    });

    it('returns empty array for non-existent state id', async () => {
      expect(await repo.findByTransitionStateId(99999)).toEqual([]);
    });
  });

  describe('defaultValue', () => {
    it('maps null defaultValue correctly', async () => {
      const metadata = await repo.findByTransitionStateId(frozenId);
      const temperatureMeta = metadata[0];
      expect(temperatureMeta.defaultValue).toBeNull();
    });
  });
});
