import { Knex } from 'knex';
import { createTestDb } from './helpers/db';
import { TransitionMetadataFieldKnexRepository } from '../../src/infrastructure/persistence/transition/transition-metadata-field.knex.repository';
import { TransitionMetadataField } from '../../src/domain/transition/entities/transition-metadata-field.entity';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: TransitionMetadataFieldKnexRepository;

// Migration seeds several fields (temperature, shotISO, labName, etc.)
// Tests read these seeded rows and add/clean up their own.

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new TransitionMetadataFieldKnexRepository(knex, txManager);
});

afterAll(async () => {
  await knex.destroy();
});

afterEach(async () => {
  await knex('transition_metadata_field').whereNotIn('name', [
    'temperature', 'shotISO', 'labName', 'deliveryMethod', 'processRequested',
    'pushPullStops', 'scansReceived', 'scansUrl', 'negativesReceived', 'negativesDate',
    'dateObtained', 'obtainmentMethod', 'obtainedFrom',
  ]).delete();
});

describe('TransitionMetadataFieldKnexRepository', () => {
  describe('findAll', () => {
    it('returns all seeded fields', async () => {
      const fields = await repo.findAll();
      const names = fields.map((f) => f.name);

      expect(names).toContain('temperature');
      expect(names).toContain('labName');
      expect(names).toContain('scansReceived');
    });

    it('orders fields by name', async () => {
      const fields = await repo.findAll();
      const names = fields.map((f) => f.name);
      expect(names).toEqual([...names].sort());
    });
  });

  describe('findById', () => {
    it('returns the field when found', async () => {
      const row = await knex('transition_metadata_field').where({ name: 'temperature' }).first();
      const field = await repo.findById(row.id);

      expect(field).not.toBeNull();
      expect(field!.name).toBe('temperature');
      expect(field!.fieldType).toBe('number');
    });

    it('returns null for non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });
  });

  describe('findByName', () => {
    it('returns the field by exact name', async () => {
      const field = await repo.findByName('labName');

      expect(field).not.toBeNull();
      expect(field!.fieldType).toBe('string');
    });

    it('returns null for unknown name', async () => {
      expect(await repo.findByName('noSuchField')).toBeNull();
    });
  });

  describe('save / update / delete', () => {
    it('saves a new field and retrieves it', async () => {
      await knex('transition_metadata_field').insert({ name: 'testField', field_type: 'string', allow_multiple: 0 });
      const row = await knex('transition_metadata_field').where({ name: 'testField' }).first();

      const field = await repo.findById(row.id);
      expect(field).not.toBeNull();
      expect(field!.name).toBe('testField');
      expect(field!.fieldType).toBe('string');
    });

    it('allowMultiple is correctly coerced to boolean', async () => {
      await knex('transition_metadata_field').insert({ name: 'multiField', field_type: 'string', allow_multiple: 1 });
      const row = await knex('transition_metadata_field').where({ name: 'multiField' }).first();

      const field = await repo.findById(row.id);
      expect(field!.allowMultiple).toBe(true);

      await knex('transition_metadata_field').where({ id: row.id }).delete();
    });

    it('updates a field name and type', async () => {
      await knex('transition_metadata_field').insert({ name: 'testField', field_type: 'string', allow_multiple: 0 });
      const row = await knex('transition_metadata_field').where({ name: 'testField' }).first();

      await repo.update(TransitionMetadataField.create({ id: row.id, name: 'testField', fieldType: 'number', allowMultiple: false }));

      const updated = await repo.findById(row.id);
      expect(updated!.fieldType).toBe('number');
    });

    it('deletes a field', async () => {
      await knex('transition_metadata_field').insert({ name: 'testField', field_type: 'string', allow_multiple: 0 });
      const row = await knex('transition_metadata_field').where({ name: 'testField' }).first();

      await repo.delete(row.id);

      expect(await repo.findById(row.id)).toBeNull();
    });
  });
});
