<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { NAlert } from 'naive-ui';
import { useReferenceStore } from '../stores/reference.js';
import PageShell from '../components/PageShell.vue';
import MiniDashboardLayout from '../components/MiniDashboardLayout.vue';
import KpiCardGrid from '../components/inventory/KpiCardGrid.vue';
import RecentEmulsionsCard from '../components/emulsion/RecentEmulsionsCard.vue';
import { useUiFeedback } from '../composables/useUiFeedback.js';

const referenceStore = useReferenceStore();
const feedback = useUiFeedback();
const route = useRoute();

const lockedDevelopmentProcess = computed(() =>
  typeof route.meta.developmentProcessFilter === 'string' ? route.meta.developmentProcessFilter : null
);

const pageSubtitle = computed(() =>
  lockedDevelopmentProcess.value
    ? 'Reference dashboard filtered by development process.'
    : 'Reference dashboard for available film stocks and processing methods.'
);

const visibleEmulsions = computed(() =>
  lockedDevelopmentProcess.value
    ? referenceStore.emulsions.filter((emulsion) => emulsion.developmentProcess.code === lockedDevelopmentProcess.value)
    : referenceStore.emulsions
);

const recentEmulsions = computed(() => visibleEmulsions.value.slice(-10));

const stats = computed(() => {
  const total = visibleEmulsions.value.length;
  const uniqueManufacturers = new Set(visibleEmulsions.value.map((emulsion) => emulsion.manufacturer)).size;
  const uniqueProcesses = new Set(visibleEmulsions.value.map((emulsion) => emulsion.developmentProcess.code)).size;
  const averageIso =
    total === 0 ? 0 : Math.round(visibleEmulsions.value.reduce((sum, emulsion) => sum + emulsion.isoSpeed, 0) / total);

  return [
    { label: 'Total visible emulsions', value: total, helper: 'Current route scope' },
    { label: 'Unique manufacturers', value: uniqueManufacturers, helper: 'Distinct brands in view' },
    { label: 'Unique development processes', value: uniqueProcesses, helper: 'C-41, B&W, E-6, and more' },
    { label: 'Average ISO', value: averageIso, helper: 'Rounded to nearest whole ISO' }
  ];
});

onMounted(async () => {
  try {
    if (!referenceStore.loaded) {
      await referenceStore.loadAll();
    }
  } catch (error) {
    feedback.error(feedback.toErrorMessage(error, 'Could not load emulsion references.'));
  }
});
</script>

<template>
  <PageShell title="Emulsions" :subtitle="pageSubtitle">
    <NAlert v-if="referenceStore.loadError" type="error" :show-icon="true">
      {{ referenceStore.loadError }}
    </NAlert>

    <MiniDashboardLayout left-panel-title="Recently added emulsions" right-panel-title="Emulsion statistics">
      <template #left>
        <RecentEmulsionsCard :emulsions="recentEmulsions" :loading="referenceStore.isLoading" />
      </template>

      <template #right>
        <KpiCardGrid :cards="stats" />
      </template>
    </MiniDashboardLayout>
  </PageShell>
</template>
