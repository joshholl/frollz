import { Inject, Injectable } from '@nestjs/common';
import type { CreateEmulsionRequest, Emulsion, UpdateEmulsionRequest } from '@frollz2/schema';
import { DomainError } from '../../domain/errors.js';
import { EmulsionRepository } from '../../infrastructure/repositories/emulsion.repository.js';

@Injectable()
export class EmulsionsService {
  constructor(@Inject(EmulsionRepository) private readonly emulsionRepository: EmulsionRepository) { }

  list(): Promise<Emulsion[]> {
    return this.emulsionRepository.list();
  }

  async findById(id: number): Promise<Emulsion> {
    const emulsion = await this.emulsionRepository.findById(id);
    if (!emulsion) {
      throw new DomainError('NOT_FOUND', 'Emulsion not found');
    }
    return emulsion;
  }

  create(input: CreateEmulsionRequest): Promise<Emulsion> {
    return this.emulsionRepository.create(input);
  }

  async update(id: number, input: UpdateEmulsionRequest): Promise<Emulsion> {
    const emulsion = await this.emulsionRepository.update(id, input);
    if (!emulsion) {
      throw new DomainError('NOT_FOUND', 'Emulsion not found');
    }
    return emulsion;
  }

  async delete(id: number): Promise<void> {
    const existing = await this.emulsionRepository.findById(id);
    if (!existing) {
      throw new DomainError('NOT_FOUND', 'Emulsion not found');
    }

    const inUse = await this.emulsionRepository.isInUse(id);
    if (inUse) {
      throw new DomainError('CONFLICT', 'Emulsion cannot be deleted because it is in use by existing films');
    }

    await this.emulsionRepository.delete(id);
  }
}
