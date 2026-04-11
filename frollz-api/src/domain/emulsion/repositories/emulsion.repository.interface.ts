import { Emulsion } from '../entities/emulsion.entity';

export const EMULSION_REPOSITORY = 'EMULSION_REPOSITORY';

export interface IEmulsionRepository {
  findById(id: string): Promise<Emulsion | null>;
  findAll(): Promise<Emulsion[]>;
  findByProcess(processId: string): Promise<Emulsion[]>;
  findByFormat(formatId: string): Promise<Emulsion[]>;
  findBrands(q?: string): Promise<string[]>;
  findManufacturers(q?: string): Promise<string[]>;
  findSpeeds(q?: string): Promise<number[]>;
  save(emulsion: Emulsion): Promise<void>;
  update(emulsion: Emulsion): Promise<void>;
  delete(id: string): Promise<void>;
}
