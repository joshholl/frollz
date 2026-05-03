import { ref, watch, type Ref } from 'vue';
import type { UpdateFilmFrameRequest } from '@frollz2/schema';
import { filmFrameSchema } from '@frollz2/schema';
import { useApi } from './useApi.js';
import { createIdempotencyKey } from './idempotency.js';
import { readApiData } from './api-envelope.js';
import { useFilmStore } from '../stores/film.js';

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface FrameMetadataAutosave {
  saveStatus: Ref<SaveStatus>;
  saveError: Ref<string | null>;
  flush: () => Promise<void>;
}

export function useFrameMetadataAutosave(
  filmId: Ref<number>,
  frameId: Ref<number>,
  patch: Ref<UpdateFilmFrameRequest>,
  debounceMs = 800
): FrameMetadataAutosave {
  const { request } = useApi();
  const filmStore = useFilmStore();

  const saveStatus = ref<SaveStatus>('idle');
  const saveError = ref<string | null>(null);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  async function save(): Promise<void> {
    saveStatus.value = 'saving';
    saveError.value = null;
    const idempotencyKey = createIdempotencyKey();
    try {
      const response = await request(
        `/api/v1/film/${filmId.value}/frames/${frameId.value}`,
        {
          method: 'PATCH',
          body: JSON.stringify(patch.value),
          headers: { 'idempotency-key': idempotencyKey }
        }
      );
      const updated = filmFrameSchema.parse(await readApiData(response));
      filmStore.patchFrame(updated);
      saveStatus.value = 'saved';
    } catch (err) {
      saveStatus.value = 'error';
      saveError.value = err instanceof Error ? err.message : 'Save failed';
    }
  }

  watch(patch, () => {
    saveStatus.value = 'pending';
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(async () => {
      debounceTimer = null;
      await save();
    }, debounceMs);
  });

  async function flush(): Promise<void> {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
      await save();
    }
  }

  return { saveStatus, saveError, flush };
}
