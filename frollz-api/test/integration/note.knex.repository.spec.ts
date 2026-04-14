import { Knex } from 'knex';
import { createTestDb } from './helpers/db';
import { NoteKnexRepository } from '../../src/infrastructure/persistence/shared/note.knex.repository';
import { Note } from '../../src/domain/shared/entities/note.entity';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: NoteKnexRepository;

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new NoteKnexRepository(knex, txManager);
});

afterAll(async () => {
  await knex.destroy();
});

beforeEach(async () => {
  await knex('note').delete();
});

const makeNote = (entityId: number, text: string, entityType: Note['entity_type'] = 'film'): Note =>
  Note.create({ entity_id: entityId, entity_type: entityType, text, created_at: new Date() });

describe('NoteKnexRepository', () => {
  describe('save / findById', () => {
    it('persists a note and retrieves it by id', async () => {
      const id = await repo.save(makeNote(1, 'Shot in Scotland'));

      const note = await repo.findById(id);
      expect(note).not.toBeNull();
      expect(note!.text).toBe('Shot in Scotland');
      expect(note!.entity_id).toBe(1);
      expect(note!.entity_type).toBe('film');
    });

    it('returns null for a non-existent id', async () => {
      expect(await repo.findById(99999)).toBeNull();
    });
  });

  describe('findAll', () => {
    it('returns all notes ordered by created_at descending', async () => {
      await repo.save(makeNote(1, 'First'));
      await repo.save(makeNote(2, 'Second'));

      const notes = await repo.findAll();
      expect(notes.length).toBeGreaterThanOrEqual(2);
    });

    it('returns empty array when no notes exist', async () => {
      await expect(repo.findAll()).resolves.toEqual([]);
    });
  });

  describe('findByEntityId', () => {
    it('returns notes matching the entity id', async () => {
      await repo.save(makeNote(10, 'Note for 10'));
      await repo.save(makeNote(10, 'Second note for 10'));
      await repo.save(makeNote(20, 'Note for 20'));

      const notes = await repo.findByEntityId(10);
      expect(notes).toHaveLength(2);
      expect(notes.every((n) => n.entity_id === 10)).toBe(true);
    });

    it('returns empty array when entity has no notes', async () => {
      await expect(repo.findByEntityId(99999)).resolves.toEqual([]);
    });

    it('orders results by created_at descending', async () => {
      // Insert with explicit timestamps so order is deterministic
      await knex('note').insert({ entity_id: 5, entity_type: 'film', text: 'Older', created_at: new Date('2024-01-01') });
      await knex('note').insert({ entity_id: 5, entity_type: 'film', text: 'Newer', created_at: new Date('2024-06-01') });

      const notes = await repo.findByEntityId(5);
      expect(notes[0].text).toBe('Newer');
      expect(notes[1].text).toBe('Older');
    });
  });

  describe('entity types', () => {
    it('persists camera entity type', async () => {
      const id = await repo.save(makeNote(3, 'Camera note', 'camera'));
      const note = await repo.findById(id);
      expect(note!.entity_type).toBe('camera');
    });

    it('persists film_state entity type', async () => {
      const id = await repo.save(makeNote(4, 'State note', 'film_state'));
      const note = await repo.findById(id);
      expect(note!.entity_type).toBe('film_state');
    });
  });
});
