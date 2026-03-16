import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { DatabaseService } from '../database/database.service';
import { Process } from './entities/stock.entity';

describe('StockService', () => {
  let service: StockService;
  let databaseService: { getCollection: jest.Mock; query: jest.Mock };

  const mockCollection = {
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCursor = { all: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: DatabaseService,
          useValue: {
            getCollection: jest.fn().mockReturnValue(mockCollection),
            query: jest.fn().mockResolvedValue(mockCursor),
          },
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    databaseService = module.get(DatabaseService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getBrands', () => {
    it('should query using CONTAINS on brand with the provided query', async () => {
      mockCursor.all.mockResolvedValue([]);

      await service.getBrands('por');

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('CONTAINS'),
        { query: 'por' },
      );
    });

    it('should use DISTINCT to avoid duplicate brand names', async () => {
      mockCursor.all.mockResolvedValue([]);

      await service.getBrands('por');

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('DISTINCT'),
        expect.anything(),
      );
    });

    it('should return matching brand names from the cursor', async () => {
      mockCursor.all.mockResolvedValue(['Portra 400', 'Portra 800']);

      const result = await service.getBrands('por');

      expect(result).toEqual(['Portra 400', 'Portra 800']);
    });

    it('should return an empty array when no brands match', async () => {
      mockCursor.all.mockResolvedValue([]);

      const result = await service.getBrands('zzz');

      expect(result).toEqual([]);
    });

    it('should pass an empty string query when called with empty string', async () => {
      mockCursor.all.mockResolvedValue([]);

      await service.getBrands('');

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.any(String),
        { query: '' },
      );
    });
  });

  describe('getManufacturers', () => {
    it('should query using CONTAINS on manufacturer with the provided query', async () => {
      mockCursor.all.mockResolvedValue([]);

      await service.getManufacturers('kod');

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('CONTAINS'),
        { query: 'kod' },
      );
    });

    it('should filter on the manufacturer field', async () => {
      mockCursor.all.mockResolvedValue([]);

      await service.getManufacturers('kod');

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('stock.manufacturer'),
        expect.anything(),
      );
    });

    it('should use DISTINCT to avoid duplicate manufacturer names', async () => {
      mockCursor.all.mockResolvedValue([]);

      await service.getManufacturers('kod');

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('DISTINCT'),
        expect.anything(),
      );
    });

    it('should return matching manufacturer names from the cursor', async () => {
      mockCursor.all.mockResolvedValue(['Kodak', 'Konica']);

      const result = await service.getManufacturers('ko');

      expect(result).toEqual(['Kodak', 'Konica']);
    });

    it('should return an empty array when no manufacturers match', async () => {
      mockCursor.all.mockResolvedValue([]);

      const result = await service.getManufacturers('zzz');

      expect(result).toEqual([]);
    });
  });

  describe('createMultipleFormats', () => {
    const dto = {
      formatKeys: ['35mm', '120'],
      process: Process.C_41,
      manufacturer: 'Kodak',
      brand: 'Portra 400',
      speed: 400,
    };

    it('should save a stock for each formatKey', async () => {
      mockCollection.save.mockImplementation((stock: any) => Promise.resolve({ _key: stock._key }));

      const results = await service.createMultipleFormats(dto);

      expect(mockCollection.save).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
    });

    it('should generate _key as {manufacturer}-{brand}-{speed}-{formatKey}', async () => {
      mockCollection.save.mockImplementation((stock: any) => Promise.resolve({ _key: stock._key }));

      const results = await service.createMultipleFormats(dto);

      expect(results[0]._key).toBe('kodak-portra-400-400-35mm');
      expect(results[1]._key).toBe('kodak-portra-400-400-120');
    });

    it('should lowercase and dasherize manufacturer and brand in the key', async () => {
      const dtoWithSpaces = { ...dto, manufacturer: 'Fuji Film', brand: 'Pro 400H' };
      mockCollection.save.mockImplementation((stock: any) => Promise.resolve({ _key: stock._key }));

      const results = await service.createMultipleFormats(dtoWithSpaces);

      expect(results[0]._key).toBe('fuji-film-pro-400h-400-35mm');
    });

    it('should set formatKey on each created stock', async () => {
      mockCollection.save.mockImplementation((stock: any) => Promise.resolve({ _key: stock._key }));

      const results = await service.createMultipleFormats(dto);

      expect(results[0].formatKey).toBe('35mm');
      expect(results[1].formatKey).toBe('120');
    });

    it('should create a single stock when only one formatKey is provided', async () => {
      const singleFormat = { ...dto, formatKeys: ['35mm'] };
      mockCollection.save.mockImplementation((stock: any) => Promise.resolve({ _key: stock._key }));

      const results = await service.createMultipleFormats(singleFormat);

      expect(mockCollection.save).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(1);
    });
  });

  describe('getSpeeds', () => {
    it('should query using CONTAINS on speed with the provided query', async () => {
      mockCursor.all.mockResolvedValue([]);

      await service.getSpeeds('40');

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('CONTAINS'),
        { query: '40' },
      );
    });

    it('should convert speed to string for matching', async () => {
      mockCursor.all.mockResolvedValue([]);

      await service.getSpeeds('40');

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('TO_STRING'),
        expect.anything(),
      );
    });

    it('should use DISTINCT to avoid duplicate speed values', async () => {
      mockCursor.all.mockResolvedValue([]);

      await service.getSpeeds('40');

      expect(databaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('DISTINCT'),
        expect.anything(),
      );
    });

    it('should return matching speeds from the cursor', async () => {
      mockCursor.all.mockResolvedValue([400, 800]);

      const result = await service.getSpeeds('4');

      expect(result).toEqual([400, 800]);
    });

    it('should return an empty array when no speeds match', async () => {
      mockCursor.all.mockResolvedValue([]);

      const result = await service.getSpeeds('999');

      expect(result).toEqual([]);
    });
  });
});
