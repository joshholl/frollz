import type { Mocked } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { randomInt } from "crypto";
import { ImportService } from "./import.service";
import { IFilmRepository } from "../../../domain/film/repositories/film.repository.interface";
import { IFilmStateRepository } from "../../../domain/film-state/repositories/film-state.repository.interface";
import { IFilmTagRepository } from "../../../domain/film-tag/repositories/film-tag.repository.interface";
import { IEmulsionRepository } from "../../../domain/emulsion/repositories/emulsion.repository.interface";
import { ITagRepository } from "../../../domain/shared/repositories/tag.repository.interface";
import { ITransitionStateRepository } from "../../../domain/transition/repositories/transition-state.repository.interface";
import { ITransitionProfileRepository } from "../../../domain/transition/repositories/transition-profile.repository.interface";
import { Emulsion } from "../../../domain/emulsion/entities/emulsion.entity";
import { Tag } from "../../../domain/shared/entities/tag.entity";
import { TransitionState } from "../../../domain/transition/entities/transition-state.entity";
import { TransitionProfile } from "../../../domain/transition/entities/transition-profile.entity";
import { INoteRepository } from "../../../domain/shared/repositories/note.repository.interface";

const randomId = () => randomInt(1, 1_000_000);

const makeEmulsion = (brand = "Kodak Portra 400"): Emulsion =>
  Emulsion.create({
    id: randomId(),
    brand,
    manufacturer: "Kodak",
    speed: 400,
    processId: randomId(),
    formatId: randomId(),
  });

const makeTag = (name = "landscape"): Tag =>
  Tag.create({ id: randomId(), name, colorCode: "#6B7280" });

const makeTransitionState = (name = "Imported"): TransitionState =>
  TransitionState.create({ id: randomId(), name });

const makeTransitionProfile = (name = "standard"): TransitionProfile =>
  TransitionProfile.create({ id: randomId(), name });

const makeFilmRepo = (
  overrides: Partial<IFilmRepository> = {},
): IFilmRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findWithFilters: vi.fn().mockResolvedValue([]),
  findByEmulsionId: vi.fn().mockResolvedValue([]),
  findChildren: vi.fn().mockResolvedValue([]),
  findByCurrentStateIds: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(randomId()),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeFilmStateRepo = (
  overrides: Partial<IFilmStateRepository> = {},
): IFilmStateRepository => ({
  findById: vi.fn().mockResolvedValue(null),
  findByFilmId: vi.fn().mockResolvedValue([]),
  findLatestByFilmId: vi.fn().mockResolvedValue(null),
  findFilmIdsByCurrentState: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(randomId()),
  saveMetadataValue: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeFilmTagRepo = (
  overrides: Partial<IFilmTagRepository> = {},
): IFilmTagRepository => ({
  add: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

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

const makeTransitionStateRepo = (
  state: TransitionState,
  overrides: Partial<ITransitionStateRepository> = {},
): ITransitionStateRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findByName: vi.fn().mockResolvedValue(state),
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeTransitionProfileRepo = (
  profile: TransitionProfile,
  overrides: Partial<ITransitionProfileRepository> = {},
): ITransitionProfileRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findByName: vi.fn().mockResolvedValue(profile),
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

const makeNoteRepo = (
  overrides: Partial<INoteRepository> = {},
): INoteRepository => ({
  findById: vi.fn().mockResolvedValue(null),
  findAll: vi.fn().mockResolvedValue([]),
  findByEntityId: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(randomId()),
  ...overrides,
});

const csv = (rows: string[]) =>
  Buffer.from([`name,emulsion,tags,notes`, ...rows].join("\n"));

describe("ImportService", () => {
  let service: ImportService;
  let filmRepo: Mocked<IFilmRepository>;
  let filmStateRepo: Mocked<IFilmStateRepository>;
  let filmTagRepo: Mocked<IFilmTagRepository>;
  let emulsionRepo: Mocked<IEmulsionRepository>;
  let tagRepo: Mocked<ITagRepository>;
  let transitionStateRepo: Mocked<ITransitionStateRepository>;
  let transitionProfileRepo: Mocked<ITransitionProfileRepository>;
  let noteRepo: Mocked<INoteRepository>;

  const importedState = makeTransitionState("Imported");
  const standardProfile = makeTransitionProfile("standard");
  const portra = makeEmulsion("Kodak Portra 400");

  beforeEach(() => {
    filmRepo = makeFilmRepo() as Mocked<IFilmRepository>;
    filmStateRepo = makeFilmStateRepo() as Mocked<IFilmStateRepository>;
    filmTagRepo = makeFilmTagRepo() as Mocked<IFilmTagRepository>;
    emulsionRepo = makeEmulsionRepo({
      findByBrand: vi.fn().mockResolvedValue(portra),
    }) as Mocked<IEmulsionRepository>;
    tagRepo = makeTagRepo() as Mocked<ITagRepository>;
    transitionStateRepo = makeTransitionStateRepo(
      importedState,
    ) as Mocked<ITransitionStateRepository>;
    transitionProfileRepo = makeTransitionProfileRepo(
      standardProfile,
    ) as Mocked<ITransitionProfileRepository>;
    noteRepo = makeNoteRepo() as Mocked<INoteRepository>;

    service = new ImportService(
      filmRepo,
      filmStateRepo,
      filmTagRepo,
      emulsionRepo,
      tagRepo,
      transitionStateRepo,
      transitionProfileRepo,
      noteRepo,
    );
  });

  describe("getTemplate", () => {
    it("returns a CSV string with the header row and one example row", () => {
      const result = service.getTemplate();
      const lines = result.trim().split("\n");
      expect(lines[0]).toBe("name,emulsion,tags,notes");
      expect(lines.length).toBeGreaterThan(1);
    });
  });

  describe("importFilms", () => {
    it("throws BadRequestException when Imported state is not seeded", async () => {
      transitionStateRepo.findByName = vi.fn().mockResolvedValue(null);
      await expect(
        service.importFilms(csv(["Roll 001,Kodak Portra 400,,"])),
      ).rejects.toThrow(BadRequestException);
    });

    it("throws BadRequestException when standard profile is not seeded", async () => {
      transitionProfileRepo.findByName = vi.fn().mockResolvedValue(null);
      await expect(
        service.importFilms(csv(["Roll 001,Kodak Portra 400,,"])),
      ).rejects.toThrow(BadRequestException);
    });

    it("imports a valid row successfully", async () => {
      const result = await service.importFilms(
        csv(["Roll 001,Kodak Portra 400,,"]),
      );
      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(filmRepo.save).toHaveBeenCalledTimes(1);
      expect(filmStateRepo.save).toHaveBeenCalledTimes(1);
    });

    it("skips a row missing the name field", async () => {
      const result = await service.importFilms(csv([",Kodak Portra 400,,"]));
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.errors[0]).toMatchObject({
        row: 2,
        reason: expect.stringContaining("name"),
      });
    });

    it("skips a row missing the emulsion field", async () => {
      const result = await service.importFilms(csv(["Roll 001,,,"]));
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.errors[0]).toMatchObject({
        row: 2,
        reason: expect.stringContaining("emulsion"),
      });
    });

    it("skips a row where the emulsion name is not found", async () => {
      emulsionRepo.findByBrand = vi.fn().mockResolvedValue(null);
      const result = await service.importFilms(
        csv(["Roll 001,Unknown Emulsion,,"]),
      );
      expect(result.imported).toBe(0);
      expect(result.skipped).toBe(1);
      expect(result.errors[0].reason).toContain("Unknown emulsion");
    });

    it("creates tags that do not already exist with default color", async () => {
      const newTagId = randomId();
      const newTag = makeTag("nature");
      tagRepo.findByName = vi.fn().mockResolvedValue(null);
      tagRepo.save = vi.fn().mockResolvedValue(newTagId);
      tagRepo.findById = vi.fn().mockResolvedValue(newTag);

      await service.importFilms(csv(["Roll 001,Kodak Portra 400,nature,"]));

      expect(tagRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ colorCode: "#6B7280" }),
      );
      expect(filmTagRepo.add).toHaveBeenCalledTimes(1);
    });

    it("reuses existing tags without creating duplicates", async () => {
      const existingTag = makeTag("landscape");
      tagRepo.findByName = vi.fn().mockResolvedValue(existingTag);

      await service.importFilms(csv(["Roll 001,Kodak Portra 400,landscape,"]));

      expect(tagRepo.save).not.toHaveBeenCalled();
      expect(filmTagRepo.add).toHaveBeenCalledWith(
        expect.any(Number),
        existingTag.id,
      );
    });

    it("stores notes as the FilmState note", async () => {
      await service.importFilms(
        csv(["Roll 001,Kodak Portra 400,,Shot in Portugal"]),
      );

      expect(filmStateRepo.save).toHaveBeenCalledTimes(1);
      expect(noteRepo.save).toHaveBeenCalledTimes(1);
      expect(noteRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          text: "Shot in Portugal",
          entity_type: "film_state",
        }),
      );
    });

    it("handles pipe-separated tags correctly", async () => {
      const tag1 = makeTag("landscape");
      const tag2 = makeTag("expired");
      tagRepo.findByName = vi
        .fn()
        .mockResolvedValueOnce(tag1)
        .mockResolvedValueOnce(tag2);

      await service.importFilms(
        csv(["Roll 001,Kodak Portra 400,landscape|expired,"]),
      );

      expect(filmTagRepo.add).toHaveBeenCalledTimes(2);
    });

    it("continues processing remaining rows after a skipped row", async () => {
      emulsionRepo.findByBrand = vi
        .fn()
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(portra);

      const result = await service.importFilms(
        csv(["Roll 001,Unknown Emulsion,,", "Roll 002,Kodak Portra 400,,"]),
      );

      expect(result.imported).toBe(1);
      expect(result.skipped).toBe(1);
      expect(result.errors).toHaveLength(1);
    });

    it("returns correct counts for a mixed batch", async () => {
      // Row 1: valid; Row 2: missing name (skipped before emulsion lookup); Row 3: valid
      emulsionRepo.findByBrand = vi.fn().mockResolvedValue(portra);

      const result = await service.importFilms(
        csv([
          "Roll 001,Kodak Portra 400,,",
          ",Kodak Portra 400,,",
          "Roll 003,Kodak Portra 400,,",
        ]),
      );

      expect(result.imported).toBe(2);
      expect(result.skipped).toBe(1);
    });
  });
});
