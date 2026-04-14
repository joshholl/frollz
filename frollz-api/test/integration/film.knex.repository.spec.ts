import { Knex } from 'knex';
import { createTestDb, seedSupporting, profileId, stateId } from './helpers/db';
import { FilmKnexRepository } from '../../src/infrastructure/persistence/film/film.knex.repository';
import { FilmStateKnexRepository } from '../../src/infrastructure/persistence/film-state/film-state.knex.repository';
import { EmulsionKnexRepository } from '../../src/infrastructure/persistence/emulsion/emulsion.knex.repository';
import { TagKnexRepository } from '../../src/infrastructure/persistence/shared/tag.knex.repository';
import { FilmTagKnexRepository } from '../../src/infrastructure/persistence/film-tag/film-tag.knex.repository';
import { Film } from '../../src/domain/film/entities/film.entity';
import { FilmState } from '../../src/domain/film-state/entities/film-state.entity';
import { Emulsion } from '../../src/domain/emulsion/entities/emulsion.entity';
import { Tag } from '../../src/domain/shared/entities/tag.entity';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let filmRepo: FilmKnexRepository;
let filmStateRepo: FilmStateKnexRepository;
let emulsionRepo: EmulsionKnexRepository;
let tagRepo: TagKnexRepository;
let filmTagRepo: FilmTagKnexRepository;
let txManager: TransactionManager;

let processId: number;
let formatId: number;
let tagId: number;
let emulsionId: number;
let addedStateId: number;
let shelvedStateId: number;
let loadedStateId: number;
let standardProfileId: number;

beforeAll(async () => {
  knex = await createTestDb();
  txManager = new TransactionManager(knex, new AppLogger());
  filmRepo = new FilmKnexRepository(knex, txManager);
  filmStateRepo = new FilmStateKnexRepository(knex, txManager);
  emulsionRepo = new EmulsionKnexRepository(knex, txManager);
  tagRepo = new TagKnexRepository(knex, txManager);
  filmTagRepo = new FilmTagKnexRepository(knex, txManager);

  const seeds = await seedSupporting(knex);
  processId = seeds.processId;
  formatId = seeds.formatId;
  tagId = seeds.tagId;

  addedStateId = await stateId(knex, 'Added');
  shelvedStateId = await stateId(knex, 'Shelved');
  loadedStateId = await stateId(knex, 'Loaded');
  standardProfileId = await profileId(knex, 'standard');

  emulsionId = await emulsionRepo.save(
    Emulsion.create({ brand: 'Kodak Portra 400', manufacturer: 'Kodak', speed: 400, processId, formatId }),
  );
});

afterAll(async () => {
  await knex.destroy();
});

beforeEach(async () => {
  await knex('film_tag').delete();
  await knex('film_state').delete();
  await knex('film').delete();
});

const saveFilm = (name = 'Roll 001'): Promise<number> =>
  filmRepo.save(Film.create({ name, emulsionId, transitionProfileId: standardProfileId }));

const addState = (filmId: number, sid: number, date = new Date()): Promise<number> =>
  filmStateRepo.save(FilmState.create({ filmId, stateId: sid, date, note: null }));

describe('FilmKnexRepository', () => {
  describe('save / findById', () => {
    it('persists a film and retrieves it by id', async () => {
      const id = await saveFilm('Roll 001');
      const film = await filmRepo.findById(id);

      expect(film).not.toBeNull();
      expect(film!.name).toBe('Roll 001');
      expect(film!.emulsionId).toBe(emulsionId);
      expect(film!.transitionProfileId).toBe(standardProfileId);
    });

    it('returns null for non-existent id', async () => {
      expect(await filmRepo.findById(99999)).toBeNull();
    });

    it('hydrates the emulsion sub-entity', async () => {
      const id = await saveFilm();
      const film = await filmRepo.findById(id);

      expect(film!.emulsion).toBeDefined();
      expect(film!.emulsion!.brand).toBe('Kodak Portra 400');
    });

    it('hydrates states in descending id order', async () => {
      const id = await saveFilm();
      const s1 = await addState(id, addedStateId, new Date('2024-01-01'));
      const s2 = await addState(id, shelvedStateId, new Date('2024-02-01'));

      const film = await filmRepo.findById(id);

      expect(film!.states).toHaveLength(2);
      expect(film!.states[0].id).toBe(s2); // desc order
      expect(film!.states[1].id).toBe(s1);
    });

    it('hydrates tag associations', async () => {
      const id = await saveFilm();
      await filmTagRepo.add(id, tagId);

      const film = await filmRepo.findById(id);

      expect(film!.tags).toHaveLength(1);
      expect(film!.tags[0].id).toBe(tagId);
    });

    it('sets parentId when film is a child of another', async () => {
      const parentId = await saveFilm('Parent Roll');
      const childId = await filmRepo.save(
        Film.create({ name: 'Child Roll', emulsionId, transitionProfileId: standardProfileId, parentId }),
      );

      const child = await filmRepo.findById(childId);
      expect(child!.parentId).toBe(parentId);
    });
  });

  describe('findAll', () => {
    it('returns all films', async () => {
      await saveFilm('Roll A');
      await saveFilm('Roll B');

      const films = await filmRepo.findAll();
      const names = films.map((f) => f.name);

      expect(names).toContain('Roll A');
      expect(names).toContain('Roll B');
    });

    it('returns empty array when no films exist', async () => {
      await expect(filmRepo.findAll()).resolves.toEqual([]);
    });
  });

  describe('findWithFilters', () => {
    it('filters by current stateId', async () => {
      const filmA = await saveFilm('A');
      const filmB = await saveFilm('B');
      await addState(filmA, addedStateId);
      await addState(filmB, addedStateId);
      await addState(filmB, shelvedStateId); // B has moved on

      const films = await filmRepo.findWithFilters({ stateIds: [addedStateId] });
      const ids = films.map((f) => f.id);

      expect(ids).toContain(filmA);
      expect(ids).not.toContain(filmB);
    });

    it('filters by emulsionId', async () => {
      const id = await saveFilm();

      const films = await filmRepo.findWithFilters({ emulsionId });
      const ids = films.map((f) => f.id);

      expect(ids).toContain(id);
    });

    it('filters by tagIds', async () => {
      const tagged = await saveFilm('Tagged');
      const untagged = await saveFilm('Untagged');
      await filmTagRepo.add(tagged, tagId);

      const films = await filmRepo.findWithFilters({ tagIds: [tagId] });
      const ids = films.map((f) => f.id);

      expect(ids).toContain(tagged);
      expect(ids).not.toContain(untagged);
    });

    it('filters by loadedDateFrom', async () => {
      const id = await saveFilm();
      await addState(id, loadedStateId, new Date('2024-06-15'));

      const films = await filmRepo.findWithFilters({
        loadedStateId,
        loadedDateFrom: new Date('2024-06-01'),
      });
      const ids = films.map((f) => f.id);

      expect(ids).toContain(id);
    });

    it('excludes films loaded before loadedDateFrom', async () => {
      const id = await saveFilm();
      await addState(id, loadedStateId, new Date('2024-01-01'));

      const films = await filmRepo.findWithFilters({
        loadedStateId,
        loadedDateFrom: new Date('2024-06-01'),
      });
      const ids = films.map((f) => f.id);

      expect(ids).not.toContain(id);
    });

    it('filters by loadedDateTo', async () => {
      const id = await saveFilm();
      await addState(id, loadedStateId, new Date('2024-03-01'));

      const films = await filmRepo.findWithFilters({
        loadedStateId,
        loadedDateTo: new Date('2024-06-01'),
      });
      const ids = films.map((f) => f.id);

      expect(ids).toContain(id);
    });

    it('filters by searchQuery matching film name', async () => {
      const id = await saveFilm('Scotland Trip');
      await saveFilm('Portugal Roll');

      const films = await filmRepo.findWithFilters({ searchQuery: 'Scotland' });
      const ids = films.map((f) => f.id);

      expect(ids).toContain(id);
    });

    it('filters by formatId (via emulsion join)', async () => {
      const id = await saveFilm();

      const films = await filmRepo.findWithFilters({ formatId });
      const ids = films.map((f) => f.id);

      expect(ids).toContain(id);
    });
  });

  describe('findByEmulsionId', () => {
    it('returns films with the given emulsionId', async () => {
      const id = await saveFilm();

      const films = await filmRepo.findByEmulsionId(emulsionId);
      const ids = films.map((f) => f.id);

      expect(ids).toContain(id);
    });

    it('returns empty array for unknown emulsionId', async () => {
      expect(await filmRepo.findByEmulsionId(99999)).toEqual([]);
    });
  });

  describe('findChildren', () => {
    it('returns child films for the given parentId', async () => {
      const parentId = await saveFilm('Parent');
      const childId = await filmRepo.save(
        Film.create({ name: 'Child', emulsionId, transitionProfileId: standardProfileId, parentId }),
      );

      const children = await filmRepo.findChildren(parentId);
      const ids = children.map((f) => f.id);

      expect(ids).toContain(childId);
    });

    it('returns empty array when film has no children', async () => {
      const parentId = await saveFilm('Lonely Parent');
      expect(await filmRepo.findChildren(parentId)).toEqual([]);
    });
  });

  describe('findByCurrentStateIds', () => {
    it('returns films whose latest state matches', async () => {
      const id = await saveFilm();
      await addState(id, addedStateId, new Date('2024-01-01'));
      await addState(id, shelvedStateId, new Date('2024-02-01'));

      const films = await filmRepo.findByCurrentStateIds([shelvedStateId]);
      const ids = films.map((f) => f.id);

      expect(ids).toContain(id);
    });

    it('does not return films whose latest state does not match', async () => {
      const id = await saveFilm();
      await addState(id, addedStateId);

      const films = await filmRepo.findByCurrentStateIds([shelvedStateId]);
      const ids = films.map((f) => f.id);

      expect(ids).not.toContain(id);
    });
  });

  describe('update', () => {
    it('updates film name', async () => {
      const id = await saveFilm('OldName');
      const film = (await filmRepo.findById(id))!;

      await filmRepo.update(Film.create({ ...film, name: 'NewName' }));

      const updated = await filmRepo.findById(id);
      expect(updated!.name).toBe('NewName');
    });
  });

  describe('delete', () => {
    it('removes the film', async () => {
      const id = await saveFilm();

      await filmRepo.delete(id);

      expect(await filmRepo.findById(id)).toBeNull();
    });

    it('cascades deletion to film states', async () => {
      const id = await saveFilm();
      const stId = await addState(id, addedStateId);

      await filmRepo.delete(id);

      expect(await filmStateRepo.findById(stId)).toBeNull();
    });

    it('does not throw when deleting non-existent id', async () => {
      await expect(filmRepo.delete(99999)).resolves.toBeUndefined();
    });
  });
});
