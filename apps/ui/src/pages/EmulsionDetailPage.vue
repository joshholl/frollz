<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { NEmpty, NSpin } from 'naive-ui';
import DetailPageShell from '../components/DetailPageShell.vue';
import EntityDetailHeaderCard from '../components/inventory/EntityDetailHeaderCard.vue';
import { useReferenceStore } from '../stores/reference.js';
import { useUiFeedback } from '../composables/useUiFeedback.js';

const route = useRoute();
const referenceStore = useReferenceStore();
const feedback = useUiFeedback();

const emulsionId = computed(() => Number(route.params.id));
const selectedEmulsion = computed(() => referenceStore.currentEmulsion);

const detailItems = computed(() => {
  if (!selectedEmulsion.value) {
    return [];
  }

  return [
    { label: 'Manufacturer', value: selectedEmulsion.value.manufacturer },
    { label: 'Brand', value: selectedEmulsion.value.brand },
    { label: 'ISO', value: String(selectedEmulsion.value.isoSpeed) },
    { label: 'Balance', value: selectedEmulsion.value.balance },
    {
      label: 'Compatible formats',
      value: selectedEmulsion.value.filmFormats.map((format) => format.code).join(', ') || '-'
    },
    { label: 'Emulsion ID', value: String(selectedEmulsion.value.id) }
  ];
});

onMounted(async () => {
  try {
    if (!referenceStore.loaded) {
      await referenceStore.loadAll();
    }

    await referenceStore.loadEmulsion(emulsionId.value);
  } catch (error) {
    feedback.error(feedback.toErrorMessage(error, 'Could not load emulsion detail.'));
  }
});
</script>

<template>
  <DetailPageShell
    title="Emulsion Detail"
    subtitle="Read-only reference detail for this stock."
    fallback-path="/emulsions"
    :error-message="referenceStore.emulsionDetailError"
  >
    <NSpin :show="referenceStore.isLoadingEmulsionDetail">
      <EntityDetailHeaderCard
        v-if="selectedEmulsion"
        :title="`${selectedEmulsion.manufacturer} ${selectedEmulsion.brand}`"
        :subtitle="`ISO ${selectedEmulsion.isoSpeed}`"
        :tag-label="selectedEmulsion.developmentProcess.label"
        tag-type="info"
        :details="detailItems"
      />

      <NEmpty
        v-if="!referenceStore.isLoadingEmulsionDetail && !selectedEmulsion"
        description="Emulsion not found."
      />
    </NSpin>
  </DetailPageShell>
</template>
