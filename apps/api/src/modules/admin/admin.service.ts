import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import type { ExportData } from '@frollz2/schema';
import { nowIso } from '../../common/utils/time.js';
import {
  UserEntity,
  FilmDeviceEntity,
  FilmLotEntity,
  FilmEntity,
  FilmJourneyEventEntity,
  FilmFrameEntity,
  FrameJourneyEventEntity,
  DeviceMountEntity
} from '../../infrastructure/entities/index.js';
import {
  mapCurrentUserEntity,
  mapFilmDeviceEntity,
  mapFilmLotSummaryEntity,
  mapFilmSummaryEntity,
  mapFilmJourneyEventEntity,
  mapFilmFrameEntity,
  mapFrameJourneyEventEntity,
  mapDeviceMountEntity
} from '../../infrastructure/mappers/index.js';

@Injectable()
export class AdminService {
  constructor(
    @Inject(EntityManager) private readonly entityManager: EntityManager
  ) { }

  async exportUserData(userId: number): Promise<ExportData> {
    // Load user with all related data
    const user = await this.entityManager.findOneOrFail(UserEntity, { id: userId });

    // Load all user devices with their related data
    const devices = await this.entityManager.find(
      FilmDeviceEntity,
      { user: userId },
      {
        populate: [
          'deviceType',
          'filmFormat',
          'camera',
          'interchangeableBack',
          'filmHolder',
          'filmHolder.holderType',
          'filmHolder.slots',
          'filmHolder.slots.slotState'
        ]
      }
    );

    // Load all film lots with their related data
    const filmLots = await this.entityManager.find(
      FilmLotEntity,
      { user: userId },
      {
        populate: [
          'emulsion',
          'emulsion.developmentProcess',
          'emulsion.filmFormats',
          'packageType',
          'packageType.filmFormat',
          'filmFormat'
        ]
      }
    );

    // Get film counts for each lot
    const filmCounts = new Map<number, number>();
    for (const lot of filmLots) {
      const count = await this.entityManager.count(FilmEntity, { filmLot: lot.id });
      filmCounts.set(lot.id, count);
    }

    // Load all films with their related data
    const films = await this.entityManager.find(
      FilmEntity,
      { user: userId },
      {
        populate: [
          'filmLot',
          'emulsion',
          'emulsion.developmentProcess',
          'emulsion.filmFormats',
          'packageType',
          'packageType.filmFormat',
          'filmFormat',
          'currentState'
        ]
      }
    );

    // Load all film journey events
    const filmEvents = await this.entityManager.find(
      FilmJourneyEventEntity,
      { user: userId },
      {
        populate: ['film', 'filmState'],
        orderBy: { recordedAt: 'ASC' }
      }
    );

    // Load all frames
    const frames = await this.entityManager.find(
      FilmFrameEntity,
      { user: userId },
      {
        populate: ['film', 'currentState']
      }
    );

    // Load all frame journey events
    const frameEvents = await this.entityManager.find(
      FrameJourneyEventEntity,
      { user: userId },
      {
        populate: ['film', 'filmFrame', 'filmState'],
        orderBy: { recordedAt: 'ASC' }
      }
    );

    // Load all device mounts
    const deviceMounts = await this.entityManager.find(
      DeviceMountEntity,
      { user: userId },
      {
        populate: ['cameraDevice', 'mountedDevice']
      }
    );

    // Map entities to DTOs
    const currentUser = mapCurrentUserEntity(user);
    const exportData: ExportData = {
      version: '1.0',
      exportedAt: nowIso(),
      user: {
        email: currentUser.email,
        name: currentUser.name
      },
      devices: devices.map(mapFilmDeviceEntity),
      filmLots: filmLots.map(lot => mapFilmLotSummaryEntity(lot, filmCounts.get(lot.id) ?? 0)),
      films: films.map(mapFilmSummaryEntity),
      filmEvents: filmEvents.map(mapFilmJourneyEventEntity),
      frames: frames.map(mapFilmFrameEntity),
      frameEvents: frameEvents.map(mapFrameJourneyEventEntity),
      deviceMounts: deviceMounts.map(mapDeviceMountEntity)
    };

    return exportData;
  }
}
