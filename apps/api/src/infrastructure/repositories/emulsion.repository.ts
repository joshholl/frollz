import type { CreateEmulsionRequest, Emulsion, UpdateEmulsionRequest } from '@frollz2/schema';

export abstract class EmulsionRepository {
  abstract list(): Promise<Emulsion[]>;
  abstract findById(id: number): Promise<Emulsion | null>;
  abstract create(input: CreateEmulsionRequest): Promise<Emulsion>;
  abstract update(id: number, input: UpdateEmulsionRequest): Promise<Emulsion | null>;
  abstract delete(id: number): Promise<boolean>;
  abstract isInUse(id: number): Promise<boolean>;
}
