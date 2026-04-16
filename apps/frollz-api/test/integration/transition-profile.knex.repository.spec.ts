import { Knex } from 'knex';
import { createTestDb } from './helpers/db';
import { TransitionProfileKnexRepository } from '../../src/infrastructure/persistence/transition/transition-profile.knex.repository';
import { TransitionProfile } from '../../src/domain/transition/entities/transition-profile.entity';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: TransitionProfileKnexRepository;

// Migration seeds 'standard', 'instant', 'bulk' profiles.
// Tests read the seeded rows and also insert their own for write tests.

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new TransitionProfileKnexRepository(knex, txManager);
});

afterAll(async () => {
  await knex.destroy();
});

afterEach(async () => {
  // Remove only test-inserted profiles (not the seeded ones)
  await knex('transition_profile').whereNotIn('name', ['standard', 'instant', 'bulk']).delete();
});

describe('TransitionProfileKnexRepository', () => {
  describe('findAll', () => {
    it('returns the three seeded profiles ordered by name', async () => {
      const profiles = await repo.findAll();
      const names = profiles.map((p) => p.name);

      expect(names).toContain('bulk');
      expect(names).toContain('instant');
      expect(names).toContain('standard');
      expect(names.indexOf('bulk')).toBeLessThan(names.indexOf('instant'));
    });
  });

  describe('findById', () => {
    it('returns the profile when found', async () => {
      const row = await knex('transition_profile').where({ name: 'standard' }).first();
      const profile = await repo.findById(row.id);

      expect(profile).not.toBeNull();
      expect(profile!.name).toBe('standard');
    });

    it('returns null for a non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });
  });

  describe('findByName', () => {
    it('returns the profile by name', async () => {
      const profile = await repo.findByName('instant');

      expect(profile).not.toBeNull();
      expect(profile!.name).toBe('instant');
    });

    it('returns null for unknown name', async () => {
      expect(await repo.findByName('custom')).toBeNull();
    });
  });

  describe('save / update / delete', () => {
    it('saves a new profile and retrieves it', async () => {
      const profile = TransitionProfile.create({ id: 0, name: 'custom' });
      await repo.save(profile);

      const found = await repo.findByName('custom');
      expect(found).not.toBeNull();
      expect(found!.name).toBe('custom');
    });

    it('updates a profile name', async () => {
      await knex('transition_profile').insert({ name: 'temp-profile' });
      const row = await knex('transition_profile').where({ name: 'temp-profile' }).first();

      await repo.update(TransitionProfile.create({ id: row.id, name: 'updated-profile' }));

      const updated = await repo.findById(row.id);
      expect(updated!.name).toBe('updated-profile');

      // cleanup
      await knex('transition_profile').where({ id: row.id }).delete();
    });

    it('deletes a profile', async () => {
      await knex('transition_profile').insert({ name: 'to-delete' });
      const row = await knex('transition_profile').where({ name: 'to-delete' }).first();

      await repo.delete(row.id);

      expect(await repo.findById(row.id)).toBeNull();
    });

    it('does not throw when deleting non-existent id', async () => {
      await expect(repo.delete(99999)).resolves.toBeUndefined();
    });
  });
});
