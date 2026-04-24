<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  NAlert,
  NButton,
  NDatePicker,
  NDrawer,
  NDrawerContent,
  NFlex,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NSelect,
  NText
} from 'naive-ui';
import type { FilmCreateRequest } from '@frollz2/schema';
import { createIdempotencyKey } from '../../composables/idempotency.js';
import { useUiFeedback } from '../../composables/useUiFeedback.js';
import { useFilmStore } from '../../stores/film.js';
import { useReferenceStore } from '../../stores/reference.js';
import type { FormState } from '../../composables/ui-state.js';

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  created: [];
}>();

const filmStore = useFilmStore();
const referenceStore = useReferenceStore();
const feedback = useUiFeedback();

const isCreatingFilm = ref(false);
const pendingCreateKey = ref<string>(createIdempotencyKey());
const expirationTimestamp = ref<number | null>(null);

const createForm = reactive<{
  name: string;
  emulsionId: number | null;
  filmFormatId: number | null;
  packageTypeId: number | null;
}>({
  name: '',
  emulsionId: null,
  filmFormatId: null,
  packageTypeId: null
});

const createState = ref<FormState>({
  loading: false,
  fieldErrors: {},
  formError: null
});

const emulsionOptions = computed(() =>
  referenceStore.emulsions.map((emulsion) => ({
    label: `${emulsion.manufacturer} ${emulsion.brand} ${emulsion.isoSpeed}`,
    value: emulsion.id
  }))
);

const formatOptions = computed(() =>
  referenceStore.filmFormats.map((format) => ({ label: format.label, value: format.id }))
);

const packageTypeOptions = computed(() => {
  if (!createForm.filmFormatId) {
    return [];
  }

  return referenceStore.packageTypesByFormat(createForm.filmFormatId).map((packageType) => ({
    label: packageType.label,
    value: packageType.id
  }));
});

const createFieldErrors = computed<Record<string, string>>(() => {
  const nextErrors: Record<string, string> = {};

  if (!createForm.name.trim()) {
    nextErrors.name = 'Film name is required.';
  }
  if (!createForm.emulsionId) {
    nextErrors.emulsionId = 'Select an emulsion.';
  }
  if (!createForm.filmFormatId) {
    nextErrors.filmFormatId = 'Select a film format.';
  }
  if (!createForm.packageTypeId) {
    nextErrors.packageTypeId = 'Select a package type.';
  }

  return nextErrors;
});

const isOpen = computed<boolean>({
  get: (): boolean => props.show,
  set: (value: boolean): void => {
    emit('update:show', value);
  }
});

function resetCreateForm(): void {
  createForm.name = '';
  createForm.emulsionId = null;
  createForm.filmFormatId = null;
  createForm.packageTypeId = null;
  expirationTimestamp.value = null;
  createState.value = {
    loading: false,
    fieldErrors: {},
    formError: null
  };
}

function handleClose(): void {
  isOpen.value = false;
}

async function submitCreateFilm(): Promise<void> {
  if (isCreatingFilm.value) {
    return;
  }

  createState.value.fieldErrors = createFieldErrors.value;
  if (Object.keys(createState.value.fieldErrors).length > 0) {
    createState.value.formError = 'Please complete all required fields.';
    return;
  }

  const payload: FilmCreateRequest = {
    name: createForm.name.trim(),
    emulsionId: createForm.emulsionId as number,
    filmFormatId: createForm.filmFormatId as number,
    packageTypeId: createForm.packageTypeId as number,
    expirationDate: expirationTimestamp.value ? new Date(expirationTimestamp.value).toISOString() : null
  };

  isCreatingFilm.value = true;
  createState.value.loading = true;
  createState.value.formError = null;

  try {
    await filmStore.createFilm(payload, pendingCreateKey.value);
    pendingCreateKey.value = createIdempotencyKey();
    resetCreateForm();
    handleClose();
    emit('created');
    feedback.success('Film created successfully.');
  } catch (error) {
    createState.value.formError = feedback.toErrorMessage(error, 'Could not create film.');
  } finally {
    isCreatingFilm.value = false;
    createState.value.loading = false;
  }
}

watch(
  () => props.show,
  (value) => {
    if (value) {
      pendingCreateKey.value = createIdempotencyKey();
      return;
    }

    resetCreateForm();
  }
);
</script>

<template>
  <NDrawer v-model:show="isOpen" placement="right" width="min(100vw, 420px)">
    <NDrawerContent title="Add film" closable>
      <NForm label-placement="top" @submit.prevent="submitCreateFilm">
        <NAlert v-if="createState.formError" type="error" :show-icon="true" style="margin-bottom: 10px;">
          {{ createState.formError }}
        </NAlert>

        <NGrid cols="1" :y-gap="4">
          <NGridItem>
            <NFormItem
              label="Name"
              required
              :label-props="{ for: 'film-create-name-input' }"
              :feedback="createState.fieldErrors.name || ''"
            >
              <NInput
                v-model:value="createForm.name"
                placeholder="Film label"
                :input-props="{ id: 'film-create-name-input', name: 'name' }"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem
              label="Emulsion"
              required
              :label-props="{ for: 'film-create-emulsion-input' }"
              :feedback="createState.fieldErrors.emulsionId || ''"
            >
              <NSelect
                v-model:value="createForm.emulsionId"
                :options="emulsionOptions"
                filterable
                placeholder="Select emulsion"
                data-testid="create-film-emulsion"
                :input-props="{ id: 'film-create-emulsion-input', name: 'emulsionId' }"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem
              label="Film format"
              required
              :label-props="{ for: 'film-create-format-input' }"
              :feedback="createState.fieldErrors.filmFormatId || ''"
            >
              <NSelect
                v-model:value="createForm.filmFormatId"
                :options="formatOptions"
                placeholder="Select format"
                data-testid="create-film-format"
                :input-props="{ id: 'film-create-format-input', name: 'filmFormatId' }"
                @update:value="createForm.packageTypeId = null"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem
              label="Package type"
              required
              :label-props="{ for: 'film-create-package-input' }"
              :feedback="createState.fieldErrors.packageTypeId || ''"
            >
              <NSelect
                v-model:value="createForm.packageTypeId"
                :options="packageTypeOptions"
                placeholder="Select package"
                data-testid="create-film-package"
                :input-props="{ id: 'film-create-package-input', name: 'packageTypeId' }"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="Expiration date" :label-props="{ for: 'film-create-expiration-input' }">
              <NDatePicker
                v-model:value="expirationTimestamp"
                type="datetime"
                clearable
                :input-props="{ id: 'film-create-expiration-input', name: 'expirationDate' }"
              />
            </NFormItem>
          </NGridItem>
        </NGrid>

        <NFlex justify="space-between" align="center">
          <NText depth="3">Required fields are marked with an asterisk.</NText>
          <NFlex>
            <NButton tertiary @click="handleClose">Cancel</NButton>
            <NButton type="primary" attr-type="submit" :loading="isCreatingFilm" :disabled="isCreatingFilm">
              Create film
            </NButton>
          </NFlex>
        </NFlex>
      </NForm>
    </NDrawerContent>
  </NDrawer>
</template>
