import { Knex } from 'knex';
import { createTestDb } from './helpers/db';
import { TagKnexRepository } from '../../src/infrastructure/persistence/shared/tag.knex.repository';
import { Tag } from '../../src/domain/shared/entities/tag.entity';
import { AppLogger } from '../../src/common/utils/app-logger';
import { TransactionManager } from '../../src/common/utils/transaction-manager';

let knex: Knex;
let repo: TagKnexRepository;

beforeAll(async () => {
  knex = await createTestDb();
  const txManager = new TransactionManager(knex, new AppLogger());
  repo = new TagKnexRepository(knex, txManager);
});

afterAll(async () => {
  await knex.destroy();
});

beforeEach(async () => {
  await knex('tag').delete();
});

const insert = (name: string, colorCode = '#ff0000', description: string | null = null): Promise<Tag> =>
  repo.save(Tag.create({ name, colorCode, description })).then((id) => repo.findById(id) as Promise<Tag>);

describe('TagKnexRepository', () => {
  describe('save / findById', () => {
    it('persists a tag and retrieves it by id', async () => {
      const id = await repo.save(Tag.create({ name: 'Expired', colorCode: '#ff0000' }));
      const tag = await repo.findById(id);

      expect(tag).not.toBeNull();
      expect(tag!.name).toBe('Expired');
      expect(tag!.colorCode).toBe('#ff0000');
      expect(tag!.description).toBeNull();
    });

    it('returns null for a non-existent id', async () => {
      const tag = await repo.findById(99999);
      expect(tag).toBeNull();
    });

    it('persists description when provided', async () => {
      const id = await repo.save(Tag.create({ name: 'Push', colorCode: '#00ff00', description: 'Pushed film' }));
      const tag = await repo.findById(id);

      expect(tag!.description).toBe('Pushed film');
    });
  });

  describe('findAll', () => {
    it('returns all tags ordered by name', async () => {
      await insert('Zebra');
      await insert('Apple');
      await insert('Mango');

      const tags = await repo.findAll();

      expect(tags.map((t) => t.name)).toEqual(['Apple', 'Mango', 'Zebra']);
    });

    it('returns empty array when no tags exist', async () => {
      await expect(repo.findAll()).resolves.toEqual([]);
    });
  });

  describe('findByName', () => {
    it('returns the tag when it exists', async () => {
      await insert('Expired');

      const tag = await repo.findByName('Expired');
      expect(tag).not.toBeNull();
      expect(tag!.name).toBe('Expired');
    });

    it('returns null when name does not match', async () => {
      const tag = await repo.findByName('NoSuchTag');
      expect(tag).toBeNull();
    });

    it('is case-sensitive for exact name match', async () => {
      await insert('Expired');

      const tag = await repo.findByName('expired');
      expect(tag).toBeNull();
    });
  });

  describe('update', () => {
    it('updates name and colorCode', async () => {
      const tag = await insert('OldName', '#aaa');

      await repo.update(Tag.create({ id: tag.id, name: 'NewName', colorCode: '#bbb' }));

      const updated = await repo.findById(tag.id);
      expect(updated!.name).toBe('NewName');
      expect(updated!.colorCode).toBe('#bbb');
    });

    it('updates description to a new value', async () => {
      const tag = await insert('Push', '#fff', null);

      await repo.update(Tag.create({ id: tag.id, name: 'Push', colorCode: '#fff', description: 'Updated desc' }));

      const updated = await repo.findById(tag.id);
      expect(updated!.description).toBe('Updated desc');
    });

    it('clears description when set to null', async () => {
      const tag = await insert('Push', '#fff', 'Some desc');

      await repo.update(Tag.create({ id: tag.id, name: 'Push', colorCode: '#fff', description: null }));

      const updated = await repo.findById(tag.id);
      expect(updated!.description).toBeNull();
    });
  });

  describe('delete', () => {
    it('removes the tag from the database', async () => {
      const tag = await insert('ToDelete');

      await repo.delete(tag.id);

      const gone = await repo.findById(tag.id);
      expect(gone).toBeNull();
    });

    it('does not throw when deleting a non-existent id', async () => {
      await expect(repo.delete(99999)).resolves.toBeUndefined();
    });

    it('only deletes the targeted tag and leaves others intact', async () => {
      const keep = await insert('Keep');
      const remove = await insert('Remove');

      await repo.delete(remove.id);

      expect(await repo.findById(keep.id)).not.toBeNull();
      expect(await repo.findById(remove.id)).toBeNull();
    });
  });
});
