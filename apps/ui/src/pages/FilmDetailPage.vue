<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NDrawer,
  NDrawerContent,
  NEmpty,
  NFlex,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  NSelect,
  NSpace,
  NTag,
  NText
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import type { CreateFilmJourneyEventRequest, FilmJourneyEvent } from '@frollz2/schema';
import { useFilmStore } from '../stores/film.js';
import { useReferenceStore } from '../stores/reference.js';
import { useReceiverStore } from '../stores/receivers.js';

const route = useRoute();
const router = useRouter();
const filmStore = useFilmStore();
const referenceStore = useReferenceStore();
const receiverStore = useReceiverStore();

const filmId = computed(() => Number(route.params.id));
const isEventDrawerOpen = ref(false);
const occurredAtTimestamp = ref<number | null>(Date.now());

const eventForm = reactive<{
  filmStateCode: string | null;
  notes: string;
  storageLocationId: number | null;
  receiverId: number | null;
  slotSideNumber: number | null;
  intendedPushPull: number | null;
  labName: string;
  labContact: string;
  actualPushPull: number | null;
  scannerOrSoftware: string;
  scanLink: string;
}>({
  filmStateCode: null,
  notes: '',
  storageLocationId: null,
  receiverId: null,
  slotSideNumber: null,
  intendedPushPull: null,
  labName: '',
  labContact: '',
  actualPushPull: null,
  scannerOrSoftware: '',
  scanLink: ''
});

const stateTypeByCode: Record<string, 'default' | 'info' | 'primary' | 'warning' | 'success'> = {
  purchased: 'default',
  stored: 'info',
  loaded: 'primary',
  exposed: 'warning',
  removed: 'warning',
  sent_for_dev: 'info',
  developed: 'success',
  scanned: 'success',
  archived: 'default'
};

const nextStateMap: Record<string, string[]> = {
  purchased: ['stored', 'loaded'],
  stored: ['stored', 'loaded'],
  loaded: ['exposed'],
  exposed: ['removed'],
  removed: ['stored', 'sent_for_dev'],
  sent_for_dev: ['developed'],
  developed: ['scanned', 'archived'],
  scanned: ['archived'],
  archived: []
};

const selectedFilm = computed(() => filmStore.currentFilm);
const transitions = computed(() => {
  const current = selectedFilm.value?.currentStateCode;
  if (!current) {
    return [];
  }

  const allowed = nextStateMap[current] ?? [];
  return referenceStore.filmStates
    .filter((state) => allowed.includes(state.code))
    .map((state) => ({ label: state.label, value: state.code }));
});

const storageLocationOptions = computed(() =>
  referenceStore.storageLocations.map((location) => ({ label: location.label, value: location.id }))
);

const receiverOptions = computed(() =>
  receiverStore.receivers
    .filter((receiver) => selectedFilm.value && receiver.filmFormatId === selectedFilm.value.filmFormatId)
    .map((receiver) => ({
      label:
        receiver.receiverTypeCode === 'camera'
          ? `${receiver.make} ${receiver.model}`
          : receiver.receiverTypeCode === 'interchangeable_back'
            ? `${receiver.name} ${receiver.system}`
            : `${receiver.name} ${receiver.brand}`,
      value: receiver.id
    }))
);

const eventsColumns = computed<DataTableColumns<FilmJourneyEvent>>(() => [
  {
    title: 'State',
    key: 'filmStateCode',
    render: (row) => h(NTag, { type: stateTypeByCode[row.filmStateCode] ?? 'default' }, { default: () => row.filmStateCode })
  },
  { title: 'Occurred', key: 'occurredAt' },
  {
    title: 'Event data',
    key: 'eventData',
    render: (row) => eventDataSummary(row)
  },
  { title: 'Notes', key: 'notes', render: (row) => row.notes ?? '-' }
]);

function eventDataSummary(event: FilmJourneyEvent): string {
  const entries = Object.entries(event.eventData)
    .filter(([, value]) => value !== null && value !== '')
    .map(([key, value]) => `${key}: ${String(value)}`);

  return entries.length > 0 ? entries.join(' | ') : '-';
}

function onChangeFilmState(code: string | null): void {
  eventForm.filmStateCode = code;
  eventForm.storageLocationId = null;
  eventForm.receiverId = null;
  eventForm.slotSideNumber = null;
  eventForm.intendedPushPull = null;
  eventForm.labName = '';
  eventForm.labContact = '';
  eventForm.actualPushPull = null;
  eventForm.scannerOrSoftware = '';
  eventForm.scanLink = '';
}

function buildEventData(): Record<string, unknown> {
  switch (eventForm.filmStateCode) {
    case 'stored': {
      const location = referenceStore.storageLocations.find((entry) => entry.id === eventForm.storageLocationId);
      return {
        storageLocationId: eventForm.storageLocationId,
        storageLocationCode: location?.code ?? ''
      };
    }
    case 'loaded':
      return {
        receiverId: eventForm.receiverId,
        slotSideNumber: eventForm.slotSideNumber,
        intendedPushPull: eventForm.intendedPushPull
      };
    case 'sent_for_dev':
      return {
        labName: eventForm.labName || null,
        labContact: eventForm.labContact || null,
        actualPushPull: eventForm.actualPushPull
      };
    case 'developed':
      return {
        labName: eventForm.labName || null,
        actualPushPull: eventForm.actualPushPull
      };
    case 'scanned':
      return {
        scannerOrSoftware: eventForm.scannerOrSoftware || null,
        scanLink: eventForm.scanLink || null
      };
    default:
      return {};
  }
}

async function submitEvent(): Promise<void> {
  if (!eventForm.filmStateCode || !occurredAtTimestamp.value || !selectedFilm.value) {
    return;
  }

  const payload: CreateFilmJourneyEventRequest = {
    filmStateCode: eventForm.filmStateCode,
    occurredAt: new Date(occurredAtTimestamp.value).toISOString(),
    notes: eventForm.notes || undefined,
    eventData: buildEventData()
  };

  await filmStore.addEvent(selectedFilm.value.id, payload);
  isEventDrawerOpen.value = false;
}

onMounted(async () => {
  if (!referenceStore.loaded) {
    await referenceStore.loadAll();
  }
  await receiverStore.loadReceivers();
  await filmStore.loadFilm(filmId.value);
});
</script>

<template>
  <NGrid cols="1" y-gap="16">
    <NGridItem>
      <NCard>
        <NFlex justify="space-between" align="center">
          <NSpace>
            <NButton tertiary @click="router.push('/film')">Back to inventory</NButton>
            <NText v-if="selectedFilm" strong>{{ selectedFilm.name }}</NText>
          </NSpace>
          <NButton type="primary" :disabled="transitions.length === 0" @click="isEventDrawerOpen = true">Add transition
            event</NButton>
        </NFlex>
        <template v-if="selectedFilm">
          <NFlex vertical size="small">
            <NTag :type="stateTypeByCode[selectedFilm.currentStateCode] ?? 'default'">{{ selectedFilm.currentState.label
              }}</NTag>
            <NText>Emulsion: {{ selectedFilm.emulsion.manufacturer }} {{ selectedFilm.emulsion.brand }} {{
              selectedFilm.emulsion.isoSpeed }}</NText>
            <NText>Format: {{ selectedFilm.filmFormat.code }} · Package: {{ selectedFilm.packageType.code }}</NText>
            <NText v-if="selectedFilm.expirationDate">Expiration: {{ selectedFilm.expirationDate }}</NText>
          </NFlex>
        </template>
        <NEmpty v-else description="Film not found" />
      </NCard>
    </NGridItem>

    <NGridItem>
      <NCard title="Journey timeline">
        <NDataTable :columns="eventsColumns" :data="filmStore.currentEvents" :row-key="(row) => row.id" />
      </NCard>
    </NGridItem>
  </NGrid>

  <NDrawer v-model:show="isEventDrawerOpen" placement="right" width="460">
    <NDrawerContent title="Add journey event" closable>
      <NForm label-placement="top">
        <NFormItem label="Target state">
          <NSelect v-model:value="eventForm.filmStateCode" :options="transitions" placeholder="Select next state"
            @update:value="onChangeFilmState" />
        </NFormItem>

        <NFormItem label="Occurred at">
          <NDatePicker v-model:value="occurredAtTimestamp" type="datetime" />
        </NFormItem>

        <NFormItem label="Notes">
          <NInput v-model:value="eventForm.notes" type="textarea" />
        </NFormItem>

        <NFormItem v-if="eventForm.filmStateCode === 'stored'" label="Storage location">
          <NSelect v-model:value="eventForm.storageLocationId" :options="storageLocationOptions"
            placeholder="Select location" />
        </NFormItem>

        <template v-if="eventForm.filmStateCode === 'loaded'">
          <NFormItem label="Receiver">
            <NSelect v-model:value="eventForm.receiverId" :options="receiverOptions" placeholder="Select receiver" />
          </NFormItem>
          <NFormItem label="Holder slot side (holders only)">
            <NInputNumber v-model:value="eventForm.slotSideNumber" />
          </NFormItem>
          <NFormItem label="Intended push/pull">
            <NInputNumber v-model:value="eventForm.intendedPushPull" />
          </NFormItem>
        </template>

        <template v-if="eventForm.filmStateCode === 'sent_for_dev'">
          <NFormItem label="Lab name">
            <NInput v-model:value="eventForm.labName" />
          </NFormItem>
          <NFormItem label="Lab contact">
            <NInput v-model:value="eventForm.labContact" />
          </NFormItem>
          <NFormItem label="Actual push/pull">
            <NInputNumber v-model:value="eventForm.actualPushPull" />
          </NFormItem>
        </template>

        <template v-if="eventForm.filmStateCode === 'developed'">
          <NFormItem label="Lab name">
            <NInput v-model:value="eventForm.labName" />
          </NFormItem>
          <NFormItem label="Actual push/pull">
            <NInputNumber v-model:value="eventForm.actualPushPull" />
          </NFormItem>
        </template>

        <template v-if="eventForm.filmStateCode === 'scanned'">
          <NFormItem label="Scanner or software">
            <NInput v-model:value="eventForm.scannerOrSoftware" />
          </NFormItem>
          <NFormItem label="Scan link">
            <NInput v-model:value="eventForm.scanLink" />
          </NFormItem>
        </template>

        <NFlex justify="end">
          <NButton tertiary @click="isEventDrawerOpen = false">Cancel</NButton>
          <NButton type="primary" @click="submitEvent">Save event</NButton>
        </NFlex>
      </NForm>
    </NDrawerContent>
  </NDrawer>
</template>
