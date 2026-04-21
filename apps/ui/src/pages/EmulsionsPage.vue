<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { NCard, NDataTable } from 'naive-ui';
import type { Emulsion } from '@frollz2/schema';
import { useReferenceStore } from '../stores/reference.js';

const referenceStore = useReferenceStore();

onMounted(async () => {
  if (!referenceStore.loaded) {
    await referenceStore.loadAll();
  }
});

const columns = [
  { title: 'Brand', key: 'brand' },
  { title: 'Manufacturer', key: 'manufacturer' },
  { title: 'ISO', key: 'isoSpeed' },
  { title: 'Process', key: 'developmentProcess' }
];

const data = computed(() =>
  referenceStore.emulsions.map((emulsion: Emulsion) => ({
    brand: emulsion.brand,
    manufacturer: emulsion.manufacturer,
    isoSpeed: emulsion.isoSpeed,
    developmentProcess: emulsion.developmentProcess.label
  }))
);
</script>

<template>
  <NCard title="Emulsions">
    <NDataTable :columns="columns" :data="data" />
  </NCard>
</template>
