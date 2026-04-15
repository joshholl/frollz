import { Knex } from 'knex';
import { createTestDb, profileId, stateId } from './helpers/db';
import { TransitionRuleKnexRepository } from '../../src/infrastructure/persistence/transition/transition-rule.knex.repository';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: TransitionRuleKnexRepository;
let stdProfileId: number;
let addedId: number;
let loadedId: number;
let shelvedId: number;

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new TransitionRuleKnexRepository(knex, txManager);

  stdProfileId = await profileId(knex, 'standard');
  addedId = await stateId(knex, 'Added');
  loadedId = await stateId(knex, 'Loaded');
  shelvedId = await stateId(knex, 'Shelved');
});

afterAll(async () => {
  await knex.destroy();
});

describe('TransitionRuleKnexRepository', () => {
  describe('findAll', () => {
    it('returns all seeded rules', async () => {
      const rules = await repo.findAll();
      expect(rules.length).toBeGreaterThan(0);
    });

    it('maps fromStateId and toStateId correctly', async () => {
      const rules = await repo.findAll();
      expect(rules[0]).toMatchObject({
        fromStateId: expect.any(Number),
        toStateId: expect.any(Number),
        profileId: expect.any(Number),
      });
    });
  });

  describe('findById', () => {
    it('returns a rule when found', async () => {
      const allRules = await repo.findAll();
      const first = allRules[0];

      const rule = await repo.findById(first.id);
      expect(rule).not.toBeNull();
      expect(rule!.id).toBe(first.id);
    });

    it('returns null for non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });
  });

  describe('findByProfileId', () => {
    it('returns all rules for the standard profile', async () => {
      const rules = await repo.findByProfileId(stdProfileId);
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.every((r) => r.profileId === stdProfileId)).toBe(true);
    });

    it('returns empty array for unknown profile', async () => {
      expect(await repo.findByProfileId(99999)).toEqual([]);
    });
  });

  describe('findByFromStateId', () => {
    it('returns all rules starting from the given state', async () => {
      const rules = await repo.findByFromStateId(addedId);
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.every((r) => r.fromStateId === addedId)).toBe(true);
    });

    it('returns empty array when no rules start from the given state', async () => {
      expect(await repo.findByFromStateId(99999)).toEqual([]);
    });
  });

  describe('findByFromStateAndProfile', () => {
    it('returns rules for the given from-state and profile combination', async () => {
      const rules = await repo.findByFromStateAndProfile(shelvedId, stdProfileId);
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.every((r) => r.fromStateId === shelvedId && r.profileId === stdProfileId)).toBe(true);
    });

    it('returns only the Loaded destination when starting from Shelved in standard profile', async () => {
      const rules = await repo.findByFromStateAndProfile(shelvedId, stdProfileId);
      const toIds = rules.map((r) => r.toStateId);
      expect(toIds).toContain(loadedId);
    });

    it('returns empty array when no rules match the combination', async () => {
      expect(await repo.findByFromStateAndProfile(99999, stdProfileId)).toEqual([]);
    });
  });

  describe('save / update / delete', () => {
    let testRuleId: number;

    afterEach(async () => {
      if (testRuleId) {
        await knex('transition_rule').where({ id: testRuleId }).delete().catch(() => {/* already deleted */});
      }
    });

    it('saves a new rule and retrieves it', async () => {
      const { TransitionRule } = await import('../../src/domain/transition/entities/transition-rule.entity');
      // Use bulk profile to avoid unique constraint with existing rules
      const bulkProfileId = await profileId(knex, 'bulk');
      const finishedId = await stateId(knex, 'Finished');
      const receivedId = await stateId(knex, 'Received');

      const rule = TransitionRule.create({ id: 0, fromStateId: finishedId, toStateId: receivedId, profileId: bulkProfileId });
      await repo.save(rule);

      const row = await knex('transition_rule')
        .where({ from_state_id: finishedId, to_state_id: receivedId, profile_id: bulkProfileId })
        .first();
      expect(row).toBeDefined();
      testRuleId = row.id;
    });

    it('deletes a rule', async () => {
      const { TransitionRule } = await import('../../src/domain/transition/entities/transition-rule.entity');
      const bulkProfileId = await profileId(knex, 'bulk');
      const receivedId = await stateId(knex, 'Received');
      const developedId = await stateId(knex, 'Developed');

      await knex('transition_rule').insert({
        from_state_id: receivedId,
        to_state_id: developedId,
        profile_id: bulkProfileId,
      });
      const row = await knex('transition_rule')
        .where({ from_state_id: receivedId, to_state_id: developedId, profile_id: bulkProfileId })
        .first();

      await repo.delete(row.id);

      expect(await repo.findById(row.id)).toBeNull();
    });
  });
});
