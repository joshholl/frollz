<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  NAlert,
  NButton,
  NCard
} from 'naive-ui';
import { useReferenceStore } from '../stores/reference.js';
import { useDeviceStore } from '../stores/devices.js';
import PageShell from '../components/PageShell.vue';
import MiniDashboardLayout from '../components/MiniDashboardLayout.vue';
import DeviceCreateDrawer from '../components/device/DeviceCreateDrawer.vue';
import RecentDevicesCard from '../components/device/RecentDevicesCard.vue';
import KpiCardGrid from '../components/inventory/KpiCardGrid.vue';
import { useUiFeedback } from '../composables/useUiFeedback.js';
import { buildDeviceKpis, filterDevicesByTypeCode } from './device-dashboard.js';

const referenceStore = useReferenceStore();
const deviceStore = useDeviceStore();
const feedback = useUiFeedback();
const route = useRoute();

const isCreateDrawerOpen = ref(false);

const deviceTypeTypeByCode: Record<string, 'default' | 'info' | 'primary'> = {
  camera: 'primary',
  interchangeable_back: 'info',
  film_holder: 'default'
};

const lockedDeviceType = computed(() =>
  typeof route.meta.deviceTypeFilter === 'string' ? route.meta.deviceTypeFilter : null
);
const filteredDevices = computed(() => filterDevicesByTypeCode(deviceStore.devices, lockedDeviceType.value));
const recentDevices = computed(() => filteredDevices.value.slice(-10));

const stats = computed(() => buildDeviceKpis(filteredDevices.value));

const pageSubtitle = computed(() =>
  lockedDeviceType.value
    ? 'Dashboard filtered by device category selected in navigation.'
    : 'Manage cameras, interchangeable backs, and holders in a compact dashboard.'
);

async function refresh(): Promise<void> {
  try {
    await deviceStore.loadDevices();
  } catch (error) {
    feedback.error(feedback.toErrorMessage(error, 'Could not load devices.'));
  }
}

onMounted(async () => {
  try {
    if (!referenceStore.loaded) {
      await referenceStore.loadAll();
    }
    await refresh();
  } catch (error) {
    feedback.error(feedback.toErrorMessage(error, 'Could not load devices.'));
  }
});

function openCreateDrawer(): void {
  isCreateDrawerOpen.value = true;
}
</script>

<template>
  <PageShell title="Devices" :subtitle="pageSubtitle">
    <template #actions>
      <NButton type="primary" @click="openCreateDrawer">Add device</NButton>
      <NButton tertiary @click="refresh">Refresh</NButton>
    </template>

    <NAlert v-if="deviceStore.listError" type="error" :show-icon="true">
      {{ deviceStore.listError }}
    </NAlert>

    <MiniDashboardLayout left-panel-title="Recently added devices" right-panel-title="Device statistics">
      <template #left>
        <RecentDevicesCard
          :devices="recentDevices"
          :film-formats="referenceStore.filmFormats"
          :loading="deviceStore.isLoading"
          :tag-type-by-code="deviceTypeTypeByCode"
        />
      </template>

      <template #right>
        <KpiCardGrid :cards="stats" />
      </template>
    </MiniDashboardLayout>
  </PageShell>

  <DeviceCreateDrawer v-model:show="isCreateDrawerOpen" />
</template>
