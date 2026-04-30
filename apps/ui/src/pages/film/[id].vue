<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { FilmFrame, FilmJourneyEvent } from '@frollz2/schema';
import { useFilmStore } from '../../stores/film.js';
import { useReferenceStore } from '../../stores/reference.js';
import { useDeviceStore } from '../../stores/devices.js';
import FilmEventForm from '../../components/FilmEventForm.vue';

const route = useRoute();
const filmStore = useFilmStore();
const referenceStore = useReferenceStore();
const deviceStore = useDeviceStore();

const filmId = computed(() => Number(route.params.id));

const eventColumns = [
  { name: 'filmStateCode', label: 'State', field: 'filmStateCode', sortable: true, align: 'left' as const },
  { name: 'occurredAt', label: 'Occurred At', field: 'occurredAt', sortable: true, align: 'left' as const },
  { name: 'notes', label: 'Notes / Data', field: (row: FilmJourneyEvent) => row.notes ?? '', align: 'left' as const }
];

const frameColumns = [
  { name: 'frameNumber', label: 'Frame', field: 'frameNumber', sortable: true, align: 'left' as const },
  { name: 'state', label: 'State', field: (row: FilmFrame) => row.currentStateCode, align: 'left' as const }
];

function formatCost(cost: { amount: number; currencyCode: string } | null): string {
  if (!cost) {
    return 'Not recorded';
  }
  return `${cost.currencyCode} ${cost.amount.toFixed(2)}`;
}

function formatKnownCost(): string {
  const film = filmStore.currentFilm;
  if (!film) {
    return 'Not recorded';
  }
  const purchase = film.purchaseCostAllocated;
  const development = film.developmentCost;
  if (!purchase && !development) {
    return 'Not recorded';
  }
  if (purchase && development && purchase.currencyCode === development.currencyCode) {
    return `${purchase.currencyCode} ${(purchase.amount + development.amount).toFixed(2)}`;
  }
  return `${formatCost(purchase)} + ${formatCost(development)}`;
}

async function load(): Promise<void> {
  if (!Number.isFinite(filmId.value)) {
    return;
  }

  await Promise.allSettled([referenceStore.loadAll(), filmStore.loadFilm(filmId.value), deviceStore.loadDevices()]);
}

async function handleEventAdded(): Promise<void> {
  await filmStore.loadFilm(filmId.value);
}

onMounted(load);
watch(filmId, load);
</script>

<template>
  <q-page class="q-pa-md column q-gutter-md">
    <q-btn flat color="primary" icon="arrow_back" label="Back to film" to="/film" class="self-start" />

    <q-banner v-if="filmStore.detailError" class="bg-red-1 text-negative" rounded>
      {{ filmStore.detailError }}
    </q-banner>

    <q-card v-if="filmStore.currentFilm" flat bordered>
      <q-card-section>
        <div class="text-h5">{{ filmStore.currentFilm.name }}</div>
        <div class="text-subtitle2 text-grey-7">
          {{ filmStore.currentFilm.emulsion.manufacturer }} {{ filmStore.currentFilm.emulsion.brand }} ·
          {{ filmStore.currentFilm.filmFormat.label }}
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section class="row q-col-gutter-md">
        <div class="col-12 col-md-6"><span class="text-grey-7">Current state:</span> {{ filmStore.currentFilm.currentState.label }}</div>
        <div class="col-12 col-md-6">
          <span class="text-grey-7">Expiration:</span>
          {{ filmStore.currentFilm.expirationDate ? new Date(filmStore.currentFilm.expirationDate).toLocaleDateString() : 'N/A' }}
        </div>
        <div class="col-12 col-md-6"><span class="text-grey-7">Purchase cost:</span> {{ formatCost(filmStore.currentFilm.purchaseCostAllocated) }}</div>
        <div class="col-12 col-md-6"><span class="text-grey-7">Development cost:</span> {{ formatCost(filmStore.currentFilm.developmentCost) }}</div>
        <div class="col-12 col-md-6"><span class="text-grey-7">Known total cost:</span> {{ formatKnownCost() }}</div>
      </q-card-section>
    </q-card>

    <q-card v-if="filmStore.currentFilm" flat bordered>
      <q-card-section>
        <div class="text-subtitle1">Add transition event</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <FilmEventForm
          :current-state-code="filmStore.currentFilm.currentStateCode"
          :film-format-id="filmStore.currentFilm.filmFormatId"
          @event-added="handleEventAdded"
        />
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section class="text-subtitle1">Journey events</q-card-section>
      <q-separator />
      <q-card-section>
        <q-table
          :rows="filmStore.currentEvents"
          :columns="eventColumns"
          row-key="id"
          flat
          bordered
          :loading="filmStore.isDetailLoading"
        >
          <template #body-cell-notes="props">
            <q-td :props="props">
              {{ props.row.notes || JSON.stringify(props.row.eventData) }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section class="text-subtitle1">Frames</q-card-section>
      <q-separator />
      <q-card-section>
        <q-table :rows="filmStore.currentFrames" :columns="frameColumns" row-key="id" flat bordered :loading="filmStore.isDetailLoading" />
      </q-card-section>
    </q-card>
  </q-page>
</template>
