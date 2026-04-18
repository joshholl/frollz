import { IProcessRepository } from "../../../domain/shared/repositories/process.repository.interface";
import { Process } from "../../../domain/shared/entities/process.entity";
import { ProcessService } from "./process.service";

const makeProcess = (id: number, name: string): Process =>
  Process.create({ id, name });

const makeRepo = (
  overrides: Partial<IProcessRepository> = {},
): IProcessRepository => ({
  findAll: vi.fn().mockResolvedValue([]),
  findById: vi.fn().mockResolvedValue(null),
  findByName: vi.fn().mockResolvedValue(null),
  save: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("ProcessService", () => {
  describe("findAll", () => {
    it("returns all processes from the repository", async () => {
      const processes = [makeProcess(1, "C-41"), makeProcess(2, "E-6")];
      const service = new ProcessService(
        makeRepo({ findAll: vi.fn().mockResolvedValue(processes) }),
      );

      const result = await service.findAll();

      expect(result).toEqual(processes);
    });

    it("returns empty array when no processes exist", async () => {
      const service = new ProcessService(makeRepo());
      await expect(service.findAll()).resolves.toEqual([]);
    });

    it("delegates directly to the repository", async () => {
      const repo = makeRepo();
      const service = new ProcessService(repo);

      await service.findAll();

      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
