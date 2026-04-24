<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NAlert, NButton, NEmpty, NSpin } from 'naive-ui';
import type { CreateFilmJourneyEventRequest } from '@frollz2/schema';
import { filmTransitionMap } from '@frollz2/schema';
import { useFilmStore } from '../stores/film.js';
import { useReferenceStore } from '../stores/reference.js';
import { useDeviceStore } from '../stores/devices.js';
import PageShell from '../components/PageShell.vue';
import EntityDetailHeaderCard from '../components/inventory/EntityDetailHeaderCard.vue';
import InventorySplitLayout from '../components/inventory/InventorySplitLayout.vue';
import FilmEventDrawer from '../components/film/FilmEventDrawer.vue';
import FilmTimelineCard from '../components/film/FilmTimelineCard.vue';
import { useUiFeedback } from '../composables/useUiFeedback.js';

const route = useRoute();
const router = useRouter();
const filmStore = useFilmStore();
const referenceStore = useReferenceStore();
const deviceStore = useDeviceStore();
const feedback = useUiFeedback();

const filmId = computed(() => Number(route.params.id));
const isEventDrawerOpen = ref(false);

const selectedFilm = computed(() => filmStore.currentFilm);
const isLargeFormatFilm = computed(() => {
  const code = selectedFilm.value?.filmFormat.code;
  return code === '4x5' || code === '8x10' || code === '2x3';
});

const detailItems = computed(() => {
  if (!selectedFilm.value) {
    return [];
  }

  return [
    {
      label: 'Emulsion',
      value: `${selectedFilm.value.emulsion.manufacturer} ${selectedFilm.value.emulsion.brand} ${selectedFilm.value.emulsion.isoSpeed}`
    },
    { label: 'Format', value: selectedFilm.value.filmFormat.code },
    { label: 'Package', value: selectedFilm.value.packageType.code },
    { label: 'Expiration', value: selectedFilm.value.expirationDate ? formatDateTime(selectedFilm.value.expirationDate) : '-' },
    { label: 'Film ID', value: String(selectedFilm.value.id) }
  ];
});
function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(parsed);
}

function goBack(): void {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push('/film');
}

function openEventDrawer(): void {
  isEventDrawerOpen.value = true;
}

onMounted(async () => {
  try {
    if (!referenceStore.loaded) {
      await referenceStore.loadAll();
    }
    await deviceStore.loadDevices();
    await filmStore.loadFilm(filmId.value);

    const initialStateCode = isLargeFormatFilm.value ? 'purchased' : selectedFilm.value?.currentStateCode ?? null;
    const hasAvailableTransitions = initialStateCode ? (filmTransitionMap.get(initialStateCode) ?? []).length > 0 : false;
    if (route.query.openEvent === '1' && hasAvailableTransitions) {
      isEventDrawerOpen.value = true;
    }
  } catch (error) {
    feedback.error(feedback.toErrorMessage(error, 'Could not load film detail.'));
  }
});
</script>

<template>
  <PageShell title="Film Detail" subtitle="Review state history and add the next transition.">
    <template #actions>
      <NButton tertiary @click="goBack">Back</NButton>
      <NButton type="primary" @click="openEventDrawer">Add transition event</NButton>
    </template>

    <NAlert v-if="filmStore.detailError" type="error" :show-icon="true" style="margin-bottom: 12px;">
      {{ filmStore.detailError }}
    </NAlert>
    <NAlert v-else-if="selectedFilm && !((filmTransitionMap.get(isLargeFormatFilm ? 'purchased' : selectedFilm.currentStateCode) ?? []).length > 0)" type="warning" :show-icon="true" style="margin-bottom: 12px;">
      No forward transitions are available from the current state.
    </NAlert>

    <NSpin :show="filmStore.isDetailLoading">
      <InventorySplitLayout left-panel-title="Film details" right-panel-title="Journey timeline">
        <template #left>
          <EntityDetailHeaderCard
            v-if="selectedFilm"
            :title="selectedFilm.name"
            :subtitle="`${selectedFilm.filmFormat.code} · ${selectedFilm.packageType.label}`"
            :details="detailItems"
          />
          <NEmpty v-else description="Film not found" />
        </template>

        <template #right>
          <FilmTimelineCard
            :events="filmStore.currentEvents"
            :devices="deviceStore.devices"
            :loading="filmStore.isDetailLoading"
            :storage-locations="referenceStore.storageLocations"
          />
        </template>
      </InventorySplitLayout>
    </NSpin>
  </PageShell>

  <FilmEventDrawer
    v-model:show="isEventDrawerOpen"
    :film-id="selectedFilm?.id ?? null"
    :current-state-code="selectedFilm?.currentStateCode ?? null"
    :film-format-id="selectedFilm?.filmFormatId ?? null"
    :is-large-format-film="isLargeFormatFilm"
  />
</template>
