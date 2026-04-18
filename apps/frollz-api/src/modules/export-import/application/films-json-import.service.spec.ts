import type { Mocked, Mock } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { randomInt } from "crypto";
import { FilmsJsonImportService } from "./films-json-import.service";
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
    processId: 1,
    formatId: 1,
  });

const makeTag = (name = "landscape"): Tag =>
  Tag.create({ id: randomId(), name, colorCode: "#6B7280" });

const makeState = (name: string): TransitionState =>
  TransitionState.create({ id: randomId(), name });

const makeProfile = (name = "standard"): TransitionProfile =>
  TransitionProfile.create({ id: randomId(), name });

const makeFilmRepo = (): IFilmRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findWithFilters: vi.fn().mockResolvedValue([]),
  findByEmulsionId: vi.fn().mockResolvedValue([]),
  findChildren: vi.fn().mockResolvedValue([]),
  findByCurrentStateIds: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(randomId()),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
});

const makeFilmStateRepo = (): IFilmStateRepository => ({
  findById: vi.fn().mockResolvedValue(null),
  findByFilmId: vi.fn().mockResolvedValue([]),
  findLatestByFilmId: vi.fn().mockResolvedValue(null),
  findFilmIdsByCurrentState: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(randomId()),
  saveMetadataValue: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
});

const makeFilmTagRepo = (): IFilmTagRepository => ({
  add: vi.fn().mockResolvedValue(undefined),
  remove: vi.fn().mockResolvedValue(undefined),
});

const makeEmulsionRepo = (
  emulsion: Emulsion | null = makeEmulsion(),
): IEmulsionRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findByBrand: vi.fn().mockResolvedValue(emulsion),
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
});

const makeTagRepo = (tag: Tag | null = null): ITagRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(tag),
  findByName: vi.fn().mockResolvedValue(tag),
  save: vi.fn().mockResolvedValue(randomId()),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
});

const allStates = [
  "Added",
  "Loaded",
  "Exposed",
  "Developed",
  "Scanned",
  "Imported",
].map(makeState);

const makeTransitionStateRepo = (): ITransitionStateRepository => ({
  findAll: vi.fn().mockResolvedValue(allStates),
  findById: vi.fn().mockResolvedValue(null),
  findByName: vi
    .fn()
    .mockImplementation((name: string) =>
      Promise.resolve(allStates.find((s) => s.name === name) ?? null),
    ),
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
});

const makeTransitionProfileRepo = (
  profile = makeProfile(),
): ITransitionProfileRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findByName: vi.fn().mockResolvedValue(profile),
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
});

const makeNoteRepo = (): INoteRepository => ({
  findById: vi.fn().mockResolvedValue(null),
  findAll: vi.fn().mockResolvedValue([]),
  findByEntityId: vi.fn().mockResolvedValue([]),
  save: vi.fn().mockResolvedValue(randomId()),
});

const filmJson = (overrides: Record<string, unknown> = {}) => ({
  name: "Roll 001",
  emulsion: { brand: "Kodak Portra 400" },
  emulsionId: 1,
  expirationDate: "2026-12-31T00:00:00.000Z",
  parentId: null,
  transitionProfileId: 1,
  tags: [],
  states: [
    {
      filmId: 1,
      stateId: 1,
      date: "2024-01-01T00:00:00.000Z",
      note: null,
      state: { id: 1, name: "Loaded" },
    },
  ],
  ...overrides,
});

const envelope = (films: unknown[]) =>
  Buffer.from(
    JSON.stringify({
      version: "v0.2.3",
      exportedAt: new Date().toISOString(),
      films,
    }),
  );

describe("FilmsJsonImportService", () => {
  let service: FilmsJsonImportService;
  let filmRepo: Mocked<IFilmRepository>;
  let filmStateRepo: Mocked<IFilmStateRepository>;
  let filmTagRepo: Mocked<IFilmTagRepository>;
  let emulsionRepo: Mocked<IEmulsionRepository>;
  let tagRepo: Mocked<ITagRepository>;
  let transitionStateRepo: Mocked<ITransitionStateRepository>;
  let transitionProfileRepo: Mocked<ITransitionProfileRepository>;
  let noteRepo: Mocked<INoteRepository>;

  beforeEach(() => {
    filmRepo = makeFilmRepo() as Mocked<IFilmRepository>;
    filmStateRepo = makeFilmStateRepo() as Mocked<IFilmStateRepository>;
    filmTagRepo = makeFilmTagRepo() as Mocked<IFilmTagRepository>;
    emulsionRepo = makeEmulsionRepo() as Mocked<IEmulsionRepository>;
    tagRepo = makeTagRepo() as Mocked<ITagRepository>;
    transitionStateRepo =
      makeTransitionStateRepo() as Mocked<ITransitionStateRepository>;
    transitionProfileRepo =
      makeTransitionProfileRepo() as Mocked<ITransitionProfileRepository>;
    noteRepo = makeNoteRepo() as Mocked<INoteRepository>;

    service = new FilmsJsonImportService(
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

  it("throws BadRequestException for invalid JSON", async () => {
    await expect(
      service.importFilmsJson(Buffer.from("not json")),
    ).rejects.toThrow(BadRequestException);
  });

  it("throws BadRequestException when standard profile is not seeded", async () => {
    transitionProfileRepo.findByName = vi.fn().mockResolvedValue(null);
    await expect(
      service.importFilmsJson(envelope([filmJson()])),
    ).rejects.toThrow(BadRequestException);
  });

  it("imports a valid film and saves it with its state history", async () => {
    const result = await service.importFilmsJson(envelope([filmJson()]));
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
    expect(filmRepo.save).toHaveBeenCalledTimes(1);
    expect(filmStateRepo.save).toHaveBeenCalledTimes(1);
  });

  it("preserves the original state date and note", async () => {
    const date = "2024-03-15T10:00:00.000Z";
    await service.importFilmsJson(
      envelope([
        filmJson({
          states: [
            {
              filmId: 1,
              stateId: 1,
              date,
              note: "Shot in Portugal",
              state: { id: 1, name: "Loaded" },
            },
          ],
        }),
      ]),
    );
    expect(filmStateRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ date: new Date(date) }),
    );

    expect(noteRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "Shot in Portugal",
        entity_type: "film_state",
        created_at: new Date(date),
      }),
    );
  });

  it("reconstructs multiple states in chronological order", async () => {
    await service.importFilmsJson(
      envelope([
        filmJson({
          states: [
            {
              filmId: 1,
              stateId: 2,
              date: "2024-02-01T00:00:00.000Z",
              note: null,
              state: { id: 2, name: "Exposed" },
            },
            {
              filmId: 1,
              stateId: 1,
              date: "2024-01-01T00:00:00.000Z",
              note: null,
              state: { id: 1, name: "Loaded" },
            },
          ],
        }),
      ]),
    );
    expect(filmStateRepo.save).toHaveBeenCalledTimes(2);
    const firstCall = (filmStateRepo.save as Mock).mock.calls[0][0];
    const secondCall = (filmStateRepo.save as Mock).mock.calls[1][0];
    expect(firstCall.date < secondCall.date).toBe(true);
  });

  it("skips a film with no state history", async () => {
    const result = await service.importFilmsJson(
      envelope([filmJson({ states: [] })]),
    );
    expect(result.skipped).toBe(1);
    expect(result.errors[0].reason).toContain("no state history");
    expect(filmRepo.save).not.toHaveBeenCalled();
  });

  it("skips a film with no emulsion", async () => {
    const result = await service.importFilmsJson(
      envelope([filmJson({ emulsion: null })]),
    );
    expect(result.skipped).toBe(1);
    expect(result.errors[0].reason).toContain("no emulsion");
  });

  it("skips a film with an unknown emulsion name", async () => {
    emulsionRepo.findByBrand = vi.fn().mockResolvedValue(null);
    const result = await service.importFilmsJson(envelope([filmJson()]));
    expect(result.skipped).toBe(1);
    expect(result.errors[0].reason).toContain("Unknown emulsion");
  });

  it("reconstructs tags on the film", async () => {
    const tag = makeTag("landscape");
    tagRepo.findByName = vi.fn().mockResolvedValue(tag);

    await service.importFilmsJson(
      envelope([
        filmJson({ tags: [{ name: "landscape", colorCode: "#6B7280" }] }),
      ]),
    );

    expect(filmTagRepo.add).toHaveBeenCalledWith(expect.any(Number), tag.id);
  });

  it("auto-creates tags not found on the target instance", async () => {
    const newTagId = randomId();
    const newTag = makeTag("nature");
    tagRepo.findByName = vi.fn().mockResolvedValue(null);
    tagRepo.save = vi.fn().mockResolvedValue(newTagId);
    tagRepo.findById = vi.fn().mockResolvedValue(newTag);

    await service.importFilmsJson(
      envelope([
        filmJson({ tags: [{ name: "nature", colorCode: "#6B7280" }] }),
      ]),
    );

    expect(tagRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ colorCode: "#6B7280" }),
    );
    expect(filmTagRepo.add).toHaveBeenCalledTimes(1);
  });

  it("uses the expirationDate from the export when present", async () => {
    await service.importFilmsJson(
      envelope([filmJson({ expirationDate: "2027-06-30T00:00:00.000Z" })]),
    );
    expect(filmRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        expirationDate: new Date("2027-06-30T00:00:00.000Z"),
      }),
    );
  });

  it("continues processing remaining films after a skipped film", async () => {
    emulsionRepo.findByBrand = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makeEmulsion());

    const result = await service.importFilmsJson(
      envelope([filmJson(), filmJson({ name: "Roll 002" })]),
    );
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
  });

  it("ignores state records with unknown state names rather than failing the whole film", async () => {
    const result = await service.importFilmsJson(
      envelope([
        filmJson({
          states: [
            {
              filmId: 1,
              stateId: 99,
              date: "2024-01-01T00:00:00.000Z",
              note: null,
              state: { id: 99, name: "UnknownState" },
            },
            {
              filmId: 1,
              stateId: 1,
              date: "2024-02-01T00:00:00.000Z",
              note: null,
              state: { id: 1, name: "Loaded" },
            },
          ],
        }),
      ]),
    );
    expect(result.imported).toBe(1);
    expect(filmStateRepo.save).toHaveBeenCalledTimes(1); // only the known state
  });
});
