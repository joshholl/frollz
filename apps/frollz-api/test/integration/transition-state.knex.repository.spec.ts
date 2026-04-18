import { Knex } from 'knex';
import { createTestDb, stateId } from './helpers/db';
import { TransitionStateKnexRepository } from '../../src/infrastructure/persistence/transition/transition-state.knex.repository';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: TransitionStateKnexRepository;

// Migration seeds 9 states + 'Imported' (from a later migration).
// Tests read these seeded states; write tests use their own rows.

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new TransitionStateKnexRepository(knex, txManager);
});

afterAll(async () => {
  await knex.destroy();
});

const seededNames = [
  'Added', 'Frozen', 'Refrigerated', 'Shelved', 'Loaded',
  'Finished', 'Sent For Development', 'Developed', 'Received', 'Imported',
];

describe('TransitionStateKnexRepository', () => {
  describe('findAll', () => {
    it('returns all seeded states', async () => {
      const states = await repo.findAll();
      const names = states.map((s) => s.name);

      for (const name of seededNames) {
        expect(names).toContain(name);
      }
    });

    it('returns states ordered by name', async () => {
      const states = await repo.findAll();
      const names = states.map((s) => s.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });
  });

  describe('findById', () => {
    it('returns the state when found', async () => {
      const addedId = await stateId(knex, 'Added');
      const state = await repo.findById(addedId);

      expect(state).not.toBeNull();
      expect(state!.name).toBe('Added');
    });

    it('returns null for non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });

    it('populates metadata associations for a state that has them', async () => {
      const frozenId = await stateId(knex, 'Frozen');
      const state = await repo.findById(frozenId);

      // Frozen has 'temperature' metadata from migration seed
      expect(state!.metadata.length).toBeGreaterThan(0);
    });

    it('returns empty metadata for a state with no associations', async () => {
      const addedId = await stateId(knex, 'Added');
      // 'Added' has acquisition metadata from migration 20260414000001
      // so we test Loaded which has none
      const loadedId = await stateId(knex, 'Loaded');
      const state = await repo.findById(loadedId);

      expect(state!.metadata).toEqual([]);
    });
  });

  describe('findByName', () => {
    it('returns the state when found by name', async () => {
      const state = await repo.findByName('Developed');

      expect(state).not.toBeNull();
      expect(state!.name).toBe('Developed');
    });

    it('returns null for unknown name', async () => {
      expect(await repo.findByName('NoSuchState')).toBeNull();
    });

    it('populates metadata on a state found by name', async () => {
      const state = await repo.findByName('Frozen');

      expect(state!.metadata.length).toBeGreaterThan(0);
    });
  });

  describe('save / update / delete (custom states)', () => {
    afterEach(async () => {
      await knex('transition_state').where({ name: 'TestState' }).delete();
      await knex('transition_state').where({ name: 'RenamedState' }).delete();
    });

    it('saves a new state and retrieves it', async () => {
      const { TransitionState } = await import('../../src/domain/transition/entities/transition-state.entity');
      const state = TransitionState.create({ id: 0, name: 'TestState' });
      await repo.save(state);

      const found = await repo.findByName('TestState');
      expect(found).not.toBeNull();
    });

    it('updates a state name', async () => {
      const { TransitionState } = await import('../../src/domain/transition/entities/transition-state.entity');
      await knex('transition_state').insert({ name: 'TestState' });
      const row = await knex('transition_state').where({ name: 'TestState' }).first();

      await repo.update(TransitionState.create({ id: row.id, name: 'RenamedState' }));

      const updated = await repo.findById(row.id);
      expect(updated!.name).toBe('RenamedState');
    });

    it('deletes a state', async () => {
      await knex('transition_state').insert({ name: 'TestState' });
      const row = await knex('transition_state').where({ name: 'TestState' }).first();

      await repo.delete(row.id);

      expect(await repo.findById(row.id)).toBeNull();
    });
  });
});
