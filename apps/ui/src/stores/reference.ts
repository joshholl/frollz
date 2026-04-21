import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import {
  developmentProcessSchema,
  emulsionSchema,
  filmFormatSchema,
  filmStateSchema,
  holderTypeSchema,
  packageTypeSchema,
  receiverTypeSchema,
  slotStateSchema,
  storageLocationSchema,
  type Emulsion,
  type FilmFormat,
  type FilmState,
  type HolderType,
  type PackageType,
  type ReceiverType,
  type ReferenceTables,
  type SlotState,
  type StorageLocation
} from '@frollz2/schema';
import { useApi } from '../composables/useApi.js';

export const useReferenceStore = defineStore('reference', () => {
  const filmFormats = ref<FilmFormat[]>([]);
  const developmentProcesses = ref<ReferenceTables['developmentProcesses']>([]);
  const packageTypes = ref<PackageType[]>([]);
  const filmStates = ref<FilmState[]>([]);
  const storageLocations = ref<StorageLocation[]>([]);
  const slotStates = ref<SlotState[]>([]);
  const receiverTypes = ref<ReceiverType[]>([]);
  const holderTypes = ref<HolderType[]>([]);
  const emulsions = ref<Emulsion[]>([]);

  const loaded = computed(() => filmFormats.value.length > 0);

  async function loadAll(): Promise<void> {
    const { request } = useApi();
    const response = await request('/api/v1/reference/emulsions');
    emulsions.value = emulsionSchema.array().parse(await response.json());

    const [formats, processes, packageTypeResponse, stateResponse, locationResponse, slotResponse, receiverResponse, holderResponse] = await Promise.all([
      request('/api/v1/reference/film-formats'),
      request('/api/v1/reference/development-processes'),
      request('/api/v1/reference/package-types'),
      request('/api/v1/reference/film-states'),
      request('/api/v1/reference/storage-locations'),
      request('/api/v1/reference/slot-states'),
      request('/api/v1/reference/receiver-types'),
      request('/api/v1/reference/holder-types')
    ]);

    filmFormats.value = filmFormatSchema.array().parse(await formats.json());
    developmentProcesses.value = developmentProcessSchema.array().parse(await processes.json());
    packageTypes.value = packageTypeSchema.array().parse(await packageTypeResponse.json());
    filmStates.value = filmStateSchema.array().parse(await stateResponse.json());
    storageLocations.value = storageLocationSchema.array().parse(await locationResponse.json());
    slotStates.value = slotStateSchema.array().parse(await slotResponse.json());
    receiverTypes.value = receiverTypeSchema.array().parse(await receiverResponse.json());
    holderTypes.value = holderTypeSchema.array().parse(await holderResponse.json());
  }

  function packageTypesByFormat(filmFormatId: number): PackageType[] {
    return packageTypes.value.filter((packageType) => packageType.filmFormatId === filmFormatId);
  }

  return {
    filmFormats,
    developmentProcesses,
    packageTypes,
    filmStates,
    storageLocations,
    slotStates,
    receiverTypes,
    holderTypes,
    emulsions,
    loaded,
    loadAll,
    packageTypesByFormat
  };
});
