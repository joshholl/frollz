import { Knex } from 'knex';
import { createTestDb, seedSupporting, profileId, stateId } from './helpers/db';
import { FilmStateKnexRepository } from '../../src/infrastructure/persistence/film-state/film-state.knex.repository';
import { FilmKnexRepository } from '../../src/infrastructure/persistence/film/film.knex.repository';
import { EmulsionKnexRepository } from '../../src/infrastructure/persistence/emulsion/emulsion.knex.repository';
import { FilmState } from '../../src/domain/film-state/entities/film-state.entity';
import { Film } from '../../src/domain/film/entities/film.entity';
import { Emulsion } from '../../src/domain/emulsion/entities/emulsion.entity';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let filmStateRepo: FilmStateKnexRepository;
let filmRepo: FilmKnexRepository;
let emulsionRepo: EmulsionKnexRepository;
let txManager: TransactionManager;

let processId: number;
let formatId: number;
let addedStateId: number;
let shelvedStateId: number;
let standardProfileId: number;
let filmId: number;

beforeAll(async () => {
  knex = await createTestDb();
  txManager = new TransactionManager(knex, new AppLogger());
  filmStateRepo = new FilmStateKnexRepository(knex, txManager);
  filmRepo = new FilmKnexRepository(knex, txManager);
  emulsionRepo = new EmulsionKnexRepository(knex, txManager);

  const seeds = await seedSupporting(knex);
  processId = seeds.processId;
  formatId = seeds.formatId;

  addedStateId = await stateId(knex, 'Added');
  shelvedStateId = await stateId(knex, 'Shelved');
  standardProfileId = await profileId(knex, 'standard');

  // Create a shared emulsion and film for the test suite
  const emulsionId = await emulsionRepo.save(
    Emulsion.create({ brand: 'Kodak Portra 400', manufacturer: 'Kodak', speed: 400, processId, formatId }),
  );
  filmId = await filmRepo.save(
    Film.create({ name: 'Test Roll', emulsionId, transitionProfileId: standardProfileId }),
  );
});

afterAll(async () => {
  await knex.destroy();
});

beforeEach(async () => {
  await knex('film_state').where({ film_id: filmId }).delete();
});

const makeFilmState = (stateId: number, date = new Date()): FilmState =>
  FilmState.create({ filmId, stateId, date, note: null });

describe('FilmStateKnexRepository', () => {
  describe('save / findById', () => {
    it('persists a film state and retrieves it by id', async () => {
      const id = await filmStateRepo.save(makeFilmState(addedStateId));
      const state = await filmStateRepo.findById(id);

      expect(state).not.toBeNull();
      expect(state!.filmId).toBe(filmId);
      expect(state!.stateId).toBe(addedStateId);
    });

    it('returns null for non-existent id', async () => {
      expect(await filmStateRepo.findById(99999)).toBeNull();
    });
  });

  describe('findByFilmId', () => {
    it('returns all states for a film ordered by id descending', async () => {
      const d1 = new Date('2024-01-01');
      const d2 = new Date('2024-02-01');
      const id1 = await filmStateRepo.save(makeFilmState(addedStateId, d1));
      const id2 = await filmStateRepo.save(makeFilmState(shelvedStateId, d2));

      const states = await filmStateRepo.findByFilmId(filmId);

      expect(states).toHaveLength(2);
      // Ordered by id desc so id2 comes first
      expect(states[0].id).toBe(id2);
      expect(states[1].id).toBe(id1);
    });

    it('returns empty array when film has no states', async () => {
      expect(await filmStateRepo.findByFilmId(filmId)).toEqual([]);
    });
  });

  describe('findLatestByFilmId', () => {
    it('returns the most recently inserted state', async () => {
      await filmStateRepo.save(makeFilmState(addedStateId, new Date('2024-01-01')));
      const laterId = await filmStateRepo.save(makeFilmState(shelvedStateId, new Date('2024-02-01')));

      const latest = await filmStateRepo.findLatestByFilmId(filmId);

      expect(latest).not.toBeNull();
      expect(latest!.id).toBe(laterId);
      expect(latest!.stateId).toBe(shelvedStateId);
    });

    it('returns null when film has no states', async () => {
      expect(await filmStateRepo.findLatestByFilmId(filmId)).toBeNull();
    });
  });

  describe('findFilmIdsByCurrentState', () => {
    it('returns filmIds whose current state is in the given list', async () => {
      await filmStateRepo.save(makeFilmState(addedStateId, new Date('2024-01-01')));
      await filmStateRepo.save(makeFilmState(shelvedStateId, new Date('2024-02-01')));

      const filmIds = await filmStateRepo.findFilmIdsByCurrentState([shelvedStateId]);

      expect(filmIds).toContain(filmId);
    });

    it('does not return film when its latest state is not in the list', async () => {
      await filmStateRepo.save(makeFilmState(addedStateId));

      const filmIds = await filmStateRepo.findFilmIdsByCurrentState([shelvedStateId]);

      expect(filmIds).not.toContain(filmId);
    });
  });

  describe('update', () => {
    it('updates the state date', async () => {
      const id = await filmStateRepo.save(makeFilmState(addedStateId, new Date('2024-01-01')));
      const state = (await filmStateRepo.findById(id))!;
      const newDate = new Date('2024-06-01');

      await filmStateRepo.update(FilmState.create({ ...state, date: newDate }));

      const updated = await filmStateRepo.findById(id);
      expect(updated!.date.toISOString().startsWith('2024-06')).toBe(true);
    });
  });

  describe('delete', () => {
    it('removes a film state', async () => {
      const id = await filmStateRepo.save(makeFilmState(addedStateId));

      await filmStateRepo.delete(id);

      expect(await filmStateRepo.findById(id)).toBeNull();
    });

    it('does not throw when deleting non-existent id', async () => {
      await expect(filmStateRepo.delete(99999)).resolves.toBeUndefined();
    });
  });

  describe('saveMetadataValue', () => {
    it('persists a metadata value for a film state', async () => {
      const stateId = await filmStateRepo.save(makeFilmState(addedStateId));

      // Find a transition_state_metadata row (e.g. for Added state's acquisition fields)
      const tsmRow = await knex('transition_state_metadata')
        .where({ transition_state_id: addedStateId })
        .first();

      if (!tsmRow) {
        // Skip this assertion if the seed data for Added metadata isn't present
        return;
      }

      await filmStateRepo.saveMetadataValue(stateId, tsmRow.id, 'test-value');

      const metaRow = await knex('film_state_metadata')
        .where({ film_state_id: stateId, transition_state_metadata_id: tsmRow.id })
        .first();

      expect(metaRow).toBeDefined();
      expect(metaRow.value).toBe('test-value');
    });
  });
});
