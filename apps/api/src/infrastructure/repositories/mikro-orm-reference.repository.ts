import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { DevelopmentProcess, FilmFormat, FilmState, HolderType, PackageType, DeviceType, SlotState, StorageLocation } from '@frollz2/schema';
import { ReferenceRepository } from './reference.repository.js';
import {
  DevelopmentProcessEntity,
  FilmFormatEntity,
  FilmStateEntity,
  HolderTypeEntity,
  PackageTypeEntity,
  DeviceTypeEntity,
  SlotStateEntity,
  StorageLocationEntity
} from '../entities/index.js';
import { mapReferenceTables } from '../mappers/index.js';

@Injectable()
export class MikroOrmReferenceRepository extends ReferenceRepository {
  constructor(@Inject(EntityManager) private readonly entityManager: EntityManager) {
    super();
  }

  async getAll() {
    const [filmFormats, developmentProcesses, packageTypes, filmStates, storageLocations, slotStates, deviceTypes, holderTypes] =
      await Promise.all([
        this.entityManager.find(FilmFormatEntity, {}, { orderBy: { id: 'asc' } }),
        this.entityManager.find(DevelopmentProcessEntity, {}, { orderBy: { id: 'asc' } }),
        this.entityManager.find(PackageTypeEntity, {}, { populate: ['filmFormat'], orderBy: { id: 'asc' } }),
        this.entityManager.find(FilmStateEntity, {}, { orderBy: { id: 'asc' } }),
        this.entityManager.find(StorageLocationEntity, {}, { orderBy: { id: 'asc' } }),
        this.entityManager.find(SlotStateEntity, {}, { orderBy: { id: 'asc' } }),
        this.entityManager.find(DeviceTypeEntity, {}, { orderBy: { id: 'asc' } }),
        this.entityManager.find(HolderTypeEntity, {}, { orderBy: { id: 'asc' } })
      ]);

    return mapReferenceTables({
      filmFormats,
      developmentProcesses,
      packageTypes,
      filmStates,
      storageLocations,
      slotStates,
      deviceTypes,
      holderTypes
    });
  }

  async listFilmFormats() {
    return (await this.entityManager.find(FilmFormatEntity, {}, { orderBy: { id: 'asc' } })).map((entity) => ({
      id: entity.id,
      code: entity.code as FilmFormat['code'],
      label: entity.label
    }));
  }

  async listDevelopmentProcesses() {
    return (await this.entityManager.find(DevelopmentProcessEntity, {}, { orderBy: { id: 'asc' } })).map((entity) => ({
      id: entity.id,
      code: entity.code as DevelopmentProcess['code'],
      label: entity.label
    }));
  }

  async listPackageTypes() {
    return (await this.entityManager.find(PackageTypeEntity, {}, { populate: ['filmFormat'], orderBy: { id: 'asc' } })).map(
      (entity) => ({
        id: entity.id,
        code: entity.code as PackageType['code'],
        label: entity.label,
        filmFormatId: entity.filmFormat.id,
        filmFormat: {
          id: entity.filmFormat.id,
          code: entity.filmFormat.code as FilmFormat['code'],
          label: entity.filmFormat.label
        }
      })
    );
  }

  async listFilmStates() {
    return (await this.entityManager.find(FilmStateEntity, {}, { orderBy: { id: 'asc' } })).map((entity) => ({
      id: entity.id,
      code: entity.code as FilmState['code'],
      label: entity.label
    }));
  }

  async listStorageLocations() {
    return (await this.entityManager.find(StorageLocationEntity, {}, { orderBy: { id: 'asc' } })).map((entity) => ({
      id: entity.id,
      code: entity.code as StorageLocation['code'],
      label: entity.label
    }));
  }

  async listSlotStates() {
    return (await this.entityManager.find(SlotStateEntity, {}, { orderBy: { id: 'asc' } })).map((entity) => ({
      id: entity.id,
      code: entity.code as SlotState['code'],
      label: entity.label
    }));
  }

  async listDeviceTypes() {
    return (await this.entityManager.find(DeviceTypeEntity, {}, { orderBy: { id: 'asc' } })).map((entity) => ({
      id: entity.id,
      code: entity.code as DeviceType['code'],
      label: entity.label
    }));
  }

  async listHolderTypes() {
    return (await this.entityManager.find(HolderTypeEntity, {}, { orderBy: { id: 'asc' } })).map((entity) => ({
      id: entity.id,
      code: entity.code as HolderType['code'],
      label: entity.label
    }));
  }

}
