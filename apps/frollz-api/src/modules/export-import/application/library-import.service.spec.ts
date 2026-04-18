import type { Mocked } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { randomInt } from "crypto";
import { LibraryImportService } from "./library-import.service";
import { IEmulsionRepository } from "../../../domain/emulsion/repositories/emulsion.repository.interface";
import { IFormatRepository } from "../../../domain/shared/repositories/format.repository.interface";
import { ITagRepository } from "../../../domain/shared/repositories/tag.repository.interface";
import { Emulsion } from "../../../domain/emulsion/entities/emulsion.entity";
import { Format } from "../../../domain/shared/entities/format.entity";
import { Tag } from "../../../domain/shared/entities/tag.entity";

const randomId = () => randomInt(1, 1_000_000);

const makeEmulsion = (brand = "Kodak"): Emulsion =>
  Emulsion.create({
    id: randomId(),
    brand,
    manufacturer: "Kodak",
    speed: 400,
    processId: 1,
    formatId: 1,
  });

const makeFormat = (id: number, name = "35mm", packageId = 1): Format =>
  Format.create({ id, packageId, name });

const makeTag = (name = "landscape"): Tag =>
  Tag.create({ id: randomId(), name, colorCode: "#6B7280" });

const makeEmulsionRepo = (
  overrides: Partial<IEmulsionRepository> = {},
): IEmulsionRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findByBrand: vi.fn().mockResolvedValue(null),
  findByProcessId: vi.fn().mockResolvedValue([]),
  findByFormatId: vi.fn().mockResolvedValue([]),
  findBrands: vi.fn().mockResolvedValue([]),
  findManufacturers: vi.fn().mockResolvedValue([]),
  findSpeeds: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(randomId()),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  updateBoxImage: vi.fn().mockResolvedValue(undefined),
  getBoxImage: vi.fn().mockResolvedValue(null),
  ...overrides,
});

const makeFormatRepo = (
  overrides: Partial<IFormatRepository> = {},
): IFormatRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findByPackageId: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(randomId()),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeTagRepo = (
  overrides: Partial<ITagRepository> = {},
): ITagRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findByName: vi.fn().mockResolvedValue(null),
  save: vi.fn().mockResolvedValue(randomId()),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const envelope = (overrides: Record<string, unknown> = {}) =>
  Buffer.from(
    JSON.stringify({
      version: "v0.2.3",
      exportedAt: new Date().toISOString(),
      tags: [],
      formats: [],
      emulsions: [],
      ...overrides,
    }),
  );

describe("LibraryImportService", () => {
  let service: LibraryImportService;
  let emulsionRepo: Mocked<IEmulsionRepository>;
  let formatRepo: Mocked<IFormatRepository>;
  let tagRepo: Mocked<ITagRepository>;

  beforeEach(() => {
    emulsionRepo = makeEmulsionRepo() as Mocked<IEmulsionRepository>;
    formatRepo = makeFormatRepo() as Mocked<IFormatRepository>;
    tagRepo = makeTagRepo() as Mocked<ITagRepository>;
    service = new LibraryImportService(emulsionRepo, formatRepo, tagRepo);
  });

  it("throws BadRequestException for invalid JSON", async () => {
    await expect(
      service.importLibrary(Buffer.from("not json")),
    ).rejects.toThrow(BadRequestException);
  });

  describe("tags", () => {
    it("imports a new tag", async () => {
      const result = await service.importLibrary(
        envelope({ tags: [{ name: "expired", colorCode: "#FF0000" }] }),
      );
      expect(tagRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ name: "expired" }),
      );
      expect(result.tags.imported).toBe(1);
      expect(result.tags.skipped).toBe(0);
    });

    it("skips a tag that already exists", async () => {
      tagRepo.findByName = vi.fn().mockResolvedValue(makeTag("expired"));
      const result = await service.importLibrary(
        envelope({ tags: [{ name: "expired", colorCode: "#FF0000" }] }),
      );
      expect(tagRepo.save).not.toHaveBeenCalled();
      expect(result.tags.skipped).toBe(1);
    });
  });

  describe("formats", () => {
    it("imports a new format and maps its id", async () => {
      formatRepo.findByPackageId = vi.fn().mockResolvedValue([]);
      formatRepo.save = vi.fn().mockResolvedValue(42);
      const result = await service.importLibrary(
        envelope({ formats: [{ id: 99, packageId: 1, name: "35mm" }] }),
      );
      expect(formatRepo.save).toHaveBeenCalled();
      expect(result.formats.imported).toBe(1);
    });

    it("skips a format that already exists", async () => {
      formatRepo.findByPackageId = vi
        .fn()
        .mockResolvedValue([makeFormat(1, "35mm", 1)]);
      const result = await service.importLibrary(
        envelope({ formats: [{ id: 1, packageId: 1, name: "35mm" }] }),
      );
      expect(formatRepo.save).not.toHaveBeenCalled();
      expect(result.formats.skipped).toBe(1);
    });
  });

  describe("emulsions", () => {
    it("imports a new emulsion", async () => {
      const result = await service.importLibrary(
        envelope({
          emulsions: [
            {
              brand: "Kodak",
              manufacturer: "Kodak",
              speed: 400,
              processId: 1,
              formatId: 1,
            },
          ],
        }),
      );
      expect(emulsionRepo.save).toHaveBeenCalled();
      expect(result.emulsions.imported).toBe(1);
    });

    it("skips an emulsion that already exists", async () => {
      emulsionRepo.findByBrand = vi
        .fn()
        .mockResolvedValue(makeEmulsion("Kodak"));
      const result = await service.importLibrary(
        envelope({
          emulsions: [
            {
              brand: "Kodak",
              manufacturer: "Kodak",
              speed: 400,
              processId: 1,
              formatId: 1,
            },
          ],
        }),
      );
      expect(emulsionRepo.save).not.toHaveBeenCalled();
      expect(result.emulsions.skipped).toBe(1);
    });

    it("remaps emulsion formatId using the format id map", async () => {
      // format id 99 in export → local id 42
      formatRepo.findByPackageId = vi.fn().mockResolvedValue([]);
      formatRepo.save = vi.fn().mockResolvedValue(42);

      await service.importLibrary(
        envelope({
          formats: [{ id: 99, packageId: 1, name: "35mm" }],
          emulsions: [
            {
              brand: "Kodak",
              manufacturer: "Kodak",
              speed: 400,
              processId: 1,
              formatId: 99,
            },
          ],
        }),
      );

      expect(emulsionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ formatId: 42 }),
      );
    });
  });

  it("returns correct aggregate counts for a mixed envelope", async () => {
    tagRepo.findByName = vi
      .fn()
      .mockResolvedValueOnce(makeTag("existing"))
      .mockResolvedValueOnce(null);
    formatRepo.findByPackageId = vi.fn().mockResolvedValue([]);
    formatRepo.save = vi.fn().mockResolvedValue(randomId());

    const result = await service.importLibrary(
      envelope({
        tags: [
          { name: "existing", colorCode: "#000" },
          { name: "new", colorCode: "#fff" },
        ],
        formats: [{ id: 1, packageId: 1, name: "New Format" }],
        emulsions: [],
      }),
    );

    expect(result.tags.imported).toBe(1);
    expect(result.tags.skipped).toBe(1);
    expect(result.formats.imported).toBe(1);
    expect(result.errors).toHaveLength(0);
  });
});
