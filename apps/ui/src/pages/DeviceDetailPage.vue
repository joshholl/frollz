<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  NCard,
  NDataTable,
  NEmpty,
  NSpin,
  NTag
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import type { FilmHolderSlot } from '@frollz2/schema';
import DetailPageShell from '../components/DetailPageShell.vue';
import DeviceLoadTimelineCard from '../components/device/DeviceLoadTimelineCard.vue';
import EntityDetailHeaderCard from '../components/inventory/EntityDetailHeaderCard.vue';
import InventorySplitLayout from '../components/inventory/InventorySplitLayout.vue';
import { useReferenceStore } from '../stores/reference.js';
import { useDeviceStore } from '../stores/devices.js';
import { useUiFeedback } from '../composables/useUiFeedback.js';
import { devicePrimaryLabel } from './device-dashboard.js';

const route = useRoute();
const referenceStore = useReferenceStore();
const deviceStore = useDeviceStore();
const feedback = useUiFeedback();

const deviceId = computed(() => Number(route.params.id));
const selectedDevice = computed(() => deviceStore.currentDevice);

const slotColumns: DataTableColumns<FilmHolderSlot> = [
  { title: 'Side', key: 'sideNumber', render: (row) => `#${row.sideNumber}` },
  {
    title: 'State',
    key: 'slotStateCode',
    render: (row) => row.slotStateCode
  },
  {
    title: 'Loaded film',
    key: 'loadedFilmId',
    render: (row) => row.loadedFilmId ?? '-'
  }
];

const detailItems = computed(() => {
  if (!selectedDevice.value) {
    return [];
  }

  const formatCode = referenceStore.filmFormats.find((format) => format.id === selectedDevice.value?.filmFormatId)?.code
    ?? String(selectedDevice.value.filmFormatId);

  const shared = [
    { label: 'Film format', value: formatCode },
    { label: 'Frame size', value: selectedDevice.value.frameSize },
    { label: 'Device ID', value: String(selectedDevice.value.id) }
  ];

  if (selectedDevice.value.deviceTypeCode === 'camera') {
    return [
      ...shared,
      { label: 'Make', value: selectedDevice.value.make },
      { label: 'Model', value: selectedDevice.value.model },
      { label: 'Serial', value: selectedDevice.value.serialNumber ?? '-' }
    ];
  }

  if (selectedDevice.value.deviceTypeCode === 'interchangeable_back') {
    return [
      ...shared,
      { label: 'Name', value: selectedDevice.value.name },
      { label: 'System', value: selectedDevice.value.system }
    ];
  }

  return [
    ...shared,
    { label: 'Name', value: selectedDevice.value.name },
    { label: 'Brand', value: selectedDevice.value.brand },
    { label: 'Holder type', value: selectedDevice.value.holderTypeCode }
  ];
});

onMounted(async () => {
  try {
    if (!referenceStore.loaded) {
      await referenceStore.loadAll();
    }

    await deviceStore.loadDevice(deviceId.value);
  } catch (error) {
    feedback.error(feedback.toErrorMessage(error, 'Could not load device detail.'));
  }
});
</script>

<template>
  <DetailPageShell
    title="Device Detail"
    subtitle="Review device metadata, holder slot state, and film load timeline."
    fallback-path="/devices"
    :error-message="deviceStore.detailError"
  >
    <NSpin :show="deviceStore.isLoadingDetail">
      <InventorySplitLayout left-panel-title="Device details" right-panel-title="Film load timeline">
        <template #left>
          <EntityDetailHeaderCard
            v-if="selectedDevice"
            :title="devicePrimaryLabel(selectedDevice)"
            :tag-label="selectedDevice.deviceTypeCode.replace('_', ' ')"
            tag-type="primary"
            :details="detailItems"
          />

          <NCard v-if="selectedDevice?.deviceTypeCode === 'film_holder'">
            <template #header>
              <NTag size="small" type="info">Holder slots</NTag>
            </template>
            <NDataTable
              :columns="slotColumns"
              :data="deviceStore.currentSlots"
              :loading="deviceStore.isLoadingDetail"
              :row-key="(row) => row.id"
              :bordered="false"
            />
            <NEmpty
              v-if="!deviceStore.isLoadingDetail && deviceStore.currentSlots.length === 0"
              description="No slots found for this holder."
            />
          </NCard>

          <NEmpty v-if="!deviceStore.isLoadingDetail && !selectedDevice" description="Device not found." />
        </template>

        <template #right>
          <DeviceLoadTimelineCard
            :events="deviceStore.currentLoadEvents"
            :loading="deviceStore.isLoadingDetail"
          />
        </template>
      </InventorySplitLayout>
    </NSpin>
  </DetailPageShell>
</template>
