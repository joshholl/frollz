<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { updateEmulsionRequestSchema, type Emulsion } from '@frollz2/schema';
import type { QForm } from 'quasar';
import { useUiFeedback } from '../composables/useUiFeedback.js';
import { useEmulsionStore } from '../stores/emulsions.js';
import { useReferenceStore } from '../stores/reference.js';

const props = defineProps<{
  modelValue: boolean;
  emulsion: Emulsion | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  updated: [];
}>();

const referenceStore = useReferenceStore();
const emulsionStore = useEmulsionStore();
const feedback = useUiFeedback();
const isSaving = ref(false);
const emulsionForm = ref<QForm | null>(null);

const form = reactive({
  manufacturer: '',
  brand: '',
  isoSpeed: null as number | null,
  developmentProcessId: null as number | null,
  filmFormatIds: [] as number[]
});

const developmentProcessOptions = computed(() =>
  referenceStore.developmentProcesses.map((process) => ({
    label: process.label,
    value: process.id
  }))
);

const filmFormatOptions = computed(() =>
  referenceStore.filmFormats.map((format) => ({
    label: format.label,
    value: format.id
  }))
);

watch(
  () => [props.modelValue, props.emulsion] as const,
  ([open, emulsion]) => {
    if (!open || !emulsion) return;
    form.manufacturer = emulsion.manufacturer;
    form.brand = emulsion.brand;
    form.isoSpeed = emulsion.isoSpeed;
    form.developmentProcessId = emulsion.developmentProcessId;
    form.filmFormatIds = emulsion.filmFormats.map((format) => format.id);
  },
  { immediate: true }
);

async function submit(): Promise<void> {
  if (!props.emulsion || isSaving.value) return;

  const result = updateEmulsionRequestSchema.safeParse({
    manufacturer: form.manufacturer.trim(),
    brand: form.brand.trim(),
    isoSpeed: Number(form.isoSpeed),
    developmentProcessId: form.developmentProcessId,
    filmFormatIds: form.filmFormatIds
  });

  if (!result.success) {
    feedback.error('Manufacturer, brand, ISO, process, and at least one format are required.');
    return;
  }

  isSaving.value = true;
  try {
    await emulsionStore.updateEmulsion(props.emulsion.id, result.data);
    feedback.success('Emulsion updated.');
    emit('update:modelValue', false);
    emit('updated');
  } catch (error) {
    feedback.error(feedback.toErrorMessage(error, 'Failed to update emulsion.'));
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card class="full-width">
      <q-card-section>
        <div class="text-h6">Edit emulsion</div>
      </q-card-section>

      <q-card-section>
        <q-form ref="emulsionForm" class="column q-gutter-md" data-testid="emulsion-edit-form" @submit="submit">
          <q-input v-model="form.manufacturer" filled label="Manufacturer" data-testid="emulsion-edit-manufacturer" />
          <q-input v-model="form.brand" filled label="Brand" data-testid="emulsion-edit-brand" />
          <q-input v-model.number="form.isoSpeed" filled type="number" min="1" label="ISO" data-testid="emulsion-edit-iso" />
          <q-select v-model="form.developmentProcessId" filled emit-value map-options :options="developmentProcessOptions" label="Development process" data-testid="emulsion-edit-process" />
          <q-select v-model="form.filmFormatIds" filled emit-value map-options multiple :options="filmFormatOptions" label="Film formats" data-testid="emulsion-edit-formats" />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="emit('update:modelValue', false)" />
        <q-btn color="primary" label="Save" :loading="isSaving" :disable="isSaving" @click="emulsionForm?.submit()" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
