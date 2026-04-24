<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  NAlert,
  NButton,
  NCard,
  NEmpty,
  NFlex,
  NTag,
  NText
} from 'naive-ui';
import { useReferenceStore } from '../stores/reference.js';
import { useDeviceStore } from '../stores/devices.js';
import PageShell from '../components/PageShell.vue';
import MiniDashboardLayout from '../components/MiniDashboardLayout.vue';
import DeviceCreateDrawer from '../components/device/DeviceCreateDrawer.vue';
import { useUiFeedback } from '../composables/useUiFeedback.js';

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
const filteredDevices = computed(() =>
  lockedDeviceType.value
    ? deviceStore.devices.filter((device) => device.deviceTypeCode === lockedDeviceType.value)
    : deviceStore.devices
);
const recentDevices = computed(() => filteredDevices.value.slice(-10));

const stats = computed(() => {
  const total = filteredDevices.value.length;

  return [
    { label: 'Total visible devices', value: total, helper: 'Current route scope' },
    {
      label: 'Cameras',
      value: filteredDevices.value.filter((device) => device.deviceTypeCode === 'camera').length,
      helper: 'Body-level capture devices'
    },
    {
      label: 'Interchangeable backs',
      value: filteredDevices.value.filter((device) => device.deviceTypeCode === 'interchangeable_back').length,
      helper: 'Modular backs and magazines'
    },
    {
      label: 'Film holders',
      value: filteredDevices.value.filter((device) => device.deviceTypeCode === 'film_holder').length,
      helper: 'Sheet and holder systems'
    }
  ];
});

const pageSubtitle = computed(() =>
  lockedDeviceType.value
    ? 'Dashboard filtered by device category selected in navigation.'
    : 'Manage cameras, interchangeable backs, and holders in a compact dashboard.'
);

function deviceDetail(deviceId: number): string {
  const device = filteredDevices.value.find((entry) => entry.id === deviceId);
  if (!device) {
    return '-';
  }

  if (device.deviceTypeCode === 'camera') {
    return `${device.make} ${device.model}`;
  }

  if (device.deviceTypeCode === 'interchangeable_back') {
    return `${device.name} · ${device.system}`;
  }

  return `${device.name} · ${device.brand} · ${device.holderTypeCode}`;
}

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
        <NCard :loading="deviceStore.isLoading">
          <NEmpty
            v-if="!deviceStore.isLoading && recentDevices.length === 0"
            description="No devices found."
          />
          <NFlex v-else vertical size="small">
            <NCard v-for="device in recentDevices" :key="device.id" size="small" embedded>
              <NFlex justify="space-between" align="center" :wrap="false">
                <NTag size="small" :type="deviceTypeTypeByCode[device.deviceTypeCode] ?? 'default'">
                  {{ device.deviceTypeCode.replace('_', ' ') }}
                </NTag>
                <NText depth="3">
                  {{ referenceStore.filmFormats.find((format) => format.id === device.filmFormatId)?.code ?? device.filmFormatId }}
                  ·
                  {{ device.frameSize }}
                </NText>
              </NFlex>
              <NText strong>{{ deviceDetail(device.id) }}</NText>
            </NCard>
          </NFlex>
        </NCard>
      </template>

      <template #right>
        <NCard v-for="card in stats" :key="card.label" size="small">
          <NFlex vertical size="small">
            <NText depth="3">{{ card.label }}</NText>
            <NText style="font-size: 1.45rem; font-weight: 700;">{{ card.value }}</NText>
            <NText depth="3">{{ card.helper }}</NText>
          </NFlex>
        </NCard>
      </template>
    </MiniDashboardLayout>
  </PageShell>

  <DeviceCreateDrawer v-model:show="isCreateDrawerOpen" />
</template>
