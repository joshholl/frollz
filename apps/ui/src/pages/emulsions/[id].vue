<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EditEmulsionDialog from '../../components/EditEmulsionDialog.vue';
import { useUiFeedback } from '../../composables/useUiFeedback.js';
import { useEmulsionStore } from '../../stores/emulsions.js';

const route = useRoute();
const router = useRouter();
const emulsionStore = useEmulsionStore();
const feedback = useUiFeedback();
const isEditDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);

const emulsionId = computed(() => Number(route.params.id));

async function load(): Promise<void> {
  if (!Number.isFinite(emulsionId.value)) {
    return;
  }

  await Promise.all([emulsionStore.loadAll(), emulsionStore.loadEmulsion(emulsionId.value)]);
}

onMounted(load);
watch(emulsionId, load);

async function deleteEmulsion(): Promise<void> {
  if (!emulsionStore.currentEmulsion || isDeleting.value) return;

  isDeleting.value = true;
  try {
    await emulsionStore.deleteEmulsion(emulsionStore.currentEmulsion.id);
    feedback.success('Emulsion deleted.');
    await router.push('/emulsions');
  } catch (error) {
    feedback.error(feedback.toErrorMessage(error, 'Failed to delete emulsion.'));
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <q-page class="q-pa-md column q-gutter-md">
    <q-btn flat color="primary" icon="arrow_back" label="Back to emulsions" to="/emulsions" class="self-start" />

    <q-banner v-if="emulsionStore.emulsionDetailError" class="bg-red-1 text-negative" rounded>
      {{ emulsionStore.emulsionDetailError }}
    </q-banner>

    <q-card v-if="emulsionStore.currentEmulsion" flat bordered>
      <q-card-section>
        <div class="text-h5">{{ emulsionStore.currentEmulsion.manufacturer }} {{ emulsionStore.currentEmulsion.brand }}</div>
        <div class="text-subtitle2 text-grey-7">ISO {{ emulsionStore.currentEmulsion.isoSpeed }}</div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" label="Edit" data-testid="emulsion-detail-edit" @click="isEditDialogOpen = true" />
        <q-btn flat color="negative" label="Delete" data-testid="emulsion-detail-delete" @click="isDeleteDialogOpen = true" />
      </q-card-actions>
      <q-separator />
      <q-card-section class="column q-gutter-sm" data-testid="emulsion-detail-meta">
        <div data-testid="emulsion-detail-process">
          <span class="text-grey-7">Process:</span>
          <span data-testid="emulsion-detail-process-value">{{ emulsionStore.currentEmulsion.developmentProcess.label }}</span>
        </div>
        <div data-testid="emulsion-detail-balance">
          <span class="text-grey-7">Balance:</span>
          <span data-testid="emulsion-detail-balance-value">{{ emulsionStore.currentEmulsion.balance }}</span>
        </div>
        <div data-testid="emulsion-detail-formats">
          <span class="text-grey-7">Formats:</span>
          <span data-testid="emulsion-detail-formats-value">{{ emulsionStore.currentEmulsion.filmFormats.map((format) => format.label).join(', ') }}</span>
        </div>
      </q-card-section>
    </q-card>

    <q-card v-else flat bordered>
      <q-card-section class="text-grey-7">Select an emulsion from the list.</q-card-section>
    </q-card>

    <EditEmulsionDialog v-model="isEditDialogOpen" :emulsion="emulsionStore.currentEmulsion" @updated="load" />

    <q-dialog v-model="isDeleteDialogOpen">
      <q-card>
        <q-card-section class="text-h6">Delete emulsion</q-card-section>
        <q-card-section>Are you sure you want to delete this emulsion?</q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="isDeleteDialogOpen = false" />
          <q-btn color="negative" label="Delete" data-testid="emulsion-detail-delete-confirm" :loading="isDeleting" :disable="isDeleting" @click="deleteEmulsion" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
