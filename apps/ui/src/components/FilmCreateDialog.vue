<script setup lang="ts">
interface SelectOption {
  label: string;
  value: number;
}

interface Props {
  formatOptions: SelectOption[];
  emulsionOptions: SelectOption[];
  packageTypeOptions: SelectOption[];
  isFormatLocked: boolean;
  isEmulsionDisabled: boolean;
  isPackageDisabled: boolean;
  isCreating: boolean;
}

defineProps<Props>();
const emit = defineEmits<{ submit: [] }>();

const isOpen = defineModel<boolean>({ required: true });
const name = defineModel<string>('name', { required: true });
const emulsionId = defineModel<number | null>('emulsionId', { required: true });
const filmFormatId = defineModel<number | null>('filmFormatId', { required: true });
const packageTypeId = defineModel<number | null>('packageTypeId', { required: true });
const expirationDate = defineModel<string>('expirationDate', { required: true });
</script>

<template>
  <q-dialog v-model="isOpen" data-testid="film-create-dialog">
    <q-card class="full-width">
      <q-card-section>
        <div class="text-h6">Create film</div>
      </q-card-section>

      <q-card-section>
        <q-form class="column q-gutter-md" data-testid="film-create-form" @submit="emit('submit')">
          <div data-testid="film-create-name">
            <q-input v-model="name" filled label="Film name" />
          </div>
          <div data-testid="film-create-format">
            <q-select
              v-model="filmFormatId"
              filled
              emit-value
              map-options
              :options="formatOptions"
              :disable="isFormatLocked"
              label="Film format"
            />
          </div>
          <div data-testid="film-create-emulsion">
            <q-select
              v-model="emulsionId"
              filled
              emit-value
              map-options
              :options="emulsionOptions"
              :disable="isEmulsionDisabled"
              label="Emulsion"
            />
          </div>
          <div data-testid="film-create-package">
            <q-select
              v-model="packageTypeId"
              filled
              emit-value
              map-options
              :options="packageTypeOptions"
              :disable="isPackageDisabled"
              label="Package type"
            />
          </div>
          <div data-testid="film-create-expiration">
            <q-input v-model="expirationDate" filled type="date" label="Expiration date (optional)" />
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="Cancel" />
        <q-btn color="primary" label="Create" :loading="isCreating" @click="emit('submit')" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
