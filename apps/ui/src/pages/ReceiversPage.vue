<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NDrawer,
  NDrawerContent,
  NEmpty,
  NFlex,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NPopconfirm,
  NSelect,
  NSpace,
  NTag,
  NText
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import type { CreateFilmReceiverRequest, FilmReceiver, UpdateFilmReceiverRequest } from '@frollz2/schema';
import { useReferenceStore } from '../stores/reference.js';
import { useReceiverStore } from '../stores/receivers.js';

const referenceStore = useReferenceStore();
const receiverStore = useReceiverStore();
const isCreateDrawerOpen = ref(false);
const isEditDrawerOpen = ref(false);
const selectedReceiverId = ref<number | null>(null);

const cameraDateAcquiredTimestamp = ref<number | null>(null);
const editCameraDateAcquiredTimestamp = ref<number | null>(null);

const createForm = reactive({
  receiverTypeCode: null as string | null,
  filmFormatId: null as number | null,
  frameSize: '',
  make: '',
  model: '',
  serialNumber: '',
  name: '',
  system: '',
  brand: '',
  holderTypeId: null as number | null
});

const editForm = reactive({
  filmFormatId: null as number | null,
  frameSize: '',
  make: '',
  model: '',
  serialNumber: '',
  name: '',
  system: '',
  brand: '',
  holderTypeId: null as number | null
});

const receiverTypeTypeByCode: Record<string, 'default' | 'info' | 'primary'> = {
  camera: 'primary',
  interchangeable_back: 'info',
  film_holder: 'default'
};

const columns = computed<DataTableColumns<FilmReceiver>>(() => [
  { title: 'Type', key: 'receiverTypeCode', render: (row) => h(NTag, { type: receiverTypeTypeByCode[row.receiverTypeCode] ?? 'default' }, { default: () => row.receiverTypeCode }) },
  { title: 'Format', key: 'filmFormatId', render: (row) => referenceStore.filmFormats.find((format) => format.id === row.filmFormatId)?.code ?? String(row.filmFormatId) },
  { title: 'Frame Size', key: 'frameSize' },
  {
    title: 'Details',
    key: 'details',
    render: (row) => {
      if (row.receiverTypeCode === 'camera') {
        return `${row.make} ${row.model}`;
      }

      if (row.receiverTypeCode === 'interchangeable_back') {
        return `${row.name} · ${row.system}`;
      }

      return `${row.name} · ${row.brand} · ${row.holderTypeCode}`;
    }
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (row) =>
      h(NSpace, null, {
        default: () => [
          h(
            NButton,
            {
              size: 'small',
              onClick: () => {
                void handleRowClick(row);
              }
            },
            { default: () => 'View' }
          ),
          h(
            NButton,
            {
              size: 'small',
              onClick: () => {
                void openEditDrawer(row);
              }
            },
            { default: () => 'Edit' }
          ),
          h(
            NPopconfirm,
            {
              onPositiveClick: () => {
                void handleDelete(row.id);
              }
            },
            {
              trigger: () => h(NButton, { size: 'small', type: 'error', secondary: true }, { default: () => 'Delete' }),
              default: () => 'Delete this receiver?'
            }
          )
        ]
      })
  }
]);

const selectedReceiver = computed(() => receiverStore.currentReceiver);
const receiverTypeOptions = computed(() =>
  referenceStore.receiverTypes.map((entry) => ({ label: entry.label, value: entry.code }))
);
const filmFormatOptions = computed(() =>
  referenceStore.filmFormats.map((entry) => ({ label: entry.label, value: entry.id }))
);
const holderTypeOptions = computed(() =>
  referenceStore.holderTypes.map((entry) => ({ label: entry.label, value: entry.id }))
);

onMounted(async () => {
  if (!referenceStore.loaded) {
    await referenceStore.loadAll();
  }
  await receiverStore.loadReceivers();
});

async function handleRowClick(row: FilmReceiver): Promise<void> {
  selectedReceiverId.value = row.id;
  await receiverStore.loadReceiver(row.id);
}

function resetCreateForm(): void {
  createForm.receiverTypeCode = null;
  createForm.filmFormatId = null;
  createForm.frameSize = '';
  createForm.make = '';
  createForm.model = '';
  createForm.serialNumber = '';
  createForm.name = '';
  createForm.system = '';
  createForm.brand = '';
  createForm.holderTypeId = null;
  cameraDateAcquiredTimestamp.value = null;
}

function resetEditForm(): void {
  editForm.filmFormatId = null;
  editForm.frameSize = '';
  editForm.make = '';
  editForm.model = '';
  editForm.serialNumber = '';
  editForm.name = '';
  editForm.system = '';
  editForm.brand = '';
  editForm.holderTypeId = null;
  editCameraDateAcquiredTimestamp.value = null;
}

async function submitCreateReceiver(): Promise<void> {
  if (!createForm.receiverTypeCode || !createForm.filmFormatId || !createForm.frameSize) {
    return;
  }

  const receiverType = referenceStore.receiverTypes.find((entry) => entry.code === createForm.receiverTypeCode);
  if (!receiverType) {
    return;
  }

  let payload: CreateFilmReceiverRequest;

  if (createForm.receiverTypeCode === 'camera') {
    if (!createForm.make || !createForm.model) {
      return;
    }

    payload = {
      receiverTypeCode: 'camera',
      receiverTypeId: receiverType.id,
      filmFormatId: createForm.filmFormatId,
      frameSize: createForm.frameSize,
      make: createForm.make,
      model: createForm.model,
      serialNumber: createForm.serialNumber || null,
      dateAcquired: cameraDateAcquiredTimestamp.value ? new Date(cameraDateAcquiredTimestamp.value).toISOString() : null
    };
  } else if (createForm.receiverTypeCode === 'interchangeable_back') {
    if (!createForm.name || !createForm.system) {
      return;
    }

    payload = {
      receiverTypeCode: 'interchangeable_back',
      receiverTypeId: receiverType.id,
      filmFormatId: createForm.filmFormatId,
      frameSize: createForm.frameSize,
      name: createForm.name,
      system: createForm.system
    };
  } else {
    if (!createForm.name || !createForm.brand || !createForm.holderTypeId) {
      return;
    }

    payload = {
      receiverTypeCode: 'film_holder',
      receiverTypeId: receiverType.id,
      filmFormatId: createForm.filmFormatId,
      frameSize: createForm.frameSize,
      name: createForm.name,
      brand: createForm.brand,
      holderTypeId: createForm.holderTypeId
    };
  }

  await receiverStore.createReceiver(payload);
  isCreateDrawerOpen.value = false;
  resetCreateForm();
}

async function openEditDrawer(receiver: FilmReceiver): Promise<void> {
  await handleRowClick(receiver);
  if (!receiverStore.currentReceiver) {
    return;
  }

  editForm.filmFormatId = receiverStore.currentReceiver.filmFormatId;
  editForm.frameSize = receiverStore.currentReceiver.frameSize;

  if (receiverStore.currentReceiver.receiverTypeCode === 'camera') {
    editForm.make = receiverStore.currentReceiver.make;
    editForm.model = receiverStore.currentReceiver.model;
    editForm.serialNumber = receiverStore.currentReceiver.serialNumber ?? '';
    editCameraDateAcquiredTimestamp.value = receiverStore.currentReceiver.dateAcquired
      ? Date.parse(receiverStore.currentReceiver.dateAcquired)
      : null;
  }

  if (receiverStore.currentReceiver.receiverTypeCode === 'interchangeable_back') {
    editForm.name = receiverStore.currentReceiver.name;
    editForm.system = receiverStore.currentReceiver.system;
  }

  if (receiverStore.currentReceiver.receiverTypeCode === 'film_holder') {
    editForm.name = receiverStore.currentReceiver.name;
    editForm.brand = receiverStore.currentReceiver.brand;
    editForm.holderTypeId = receiverStore.currentReceiver.holderTypeId;
  }

  isEditDrawerOpen.value = true;
}

async function submitEditReceiver(): Promise<void> {
  if (!receiverStore.currentReceiver || !selectedReceiverId.value) {
    return;
  }

  const payload: UpdateFilmReceiverRequest = {
    filmFormatId: editForm.filmFormatId ?? undefined,
    frameSize: editForm.frameSize || undefined,
    ...(receiverStore.currentReceiver.receiverTypeCode === 'camera'
      ? {
        make: editForm.make || undefined,
        model: editForm.model || undefined,
        serialNumber: editForm.serialNumber || null,
        dateAcquired: editCameraDateAcquiredTimestamp.value
          ? new Date(editCameraDateAcquiredTimestamp.value).toISOString()
          : null
      }
      : {}),
    ...(receiverStore.currentReceiver.receiverTypeCode === 'interchangeable_back'
      ? {
        name: editForm.name || undefined,
        system: editForm.system || undefined
      }
      : {}),
    ...(receiverStore.currentReceiver.receiverTypeCode === 'film_holder'
      ? {
        name: editForm.name || undefined,
        brand: editForm.brand || undefined,
        holderTypeId: editForm.holderTypeId ?? undefined
      }
      : {})
  };

  await receiverStore.updateReceiver(selectedReceiverId.value, payload);
  if (selectedReceiverId.value) {
    await receiverStore.loadReceiver(selectedReceiverId.value);
  }
  isEditDrawerOpen.value = false;
}

async function handleDelete(id: number): Promise<void> {
  await receiverStore.deleteReceiver(id);
  if (selectedReceiverId.value === id) {
    selectedReceiverId.value = null;
  }
}
</script>

<template>
  <NGrid cols="1 1 2" x-gap="16" y-gap="16">
    <NGridItem>
      <NCard title="Receivers">
        <NFlex vertical size="medium">
          <NFlex justify="space-between" align="center">
            <NText>Current camera, back, and holder inventory.</NText>
            <NButton type="primary" @click="isCreateDrawerOpen = true">Add receiver</NButton>
          </NFlex>
          <NDataTable :columns="columns" :data="receiverStore.receivers" :row-key="(row) => row.id"
            @row-click="handleRowClick" />
          <NEmpty v-if="receiverStore.receivers.length === 0" description="No receivers found" />
        </NFlex>
      </NCard>
    </NGridItem>
    <NGridItem>
      <NCard title="Receiver detail">
        <template v-if="selectedReceiver">
          <NFlex vertical size="medium">
            <NFlex justify="space-between" align="center">
              <NText strong>{{ selectedReceiver.receiverTypeCode }}</NText>
              <NButton @click="openEditDrawer(selectedReceiver)">Edit selected</NButton>
            </NFlex>
            <NText>Format: {{referenceStore.filmFormats.find((format) => format.id ===
              selectedReceiver.filmFormatId)?.code ?? selectedReceiver.filmFormatId }}</NText>
            <template v-if="selectedReceiver.receiverTypeCode === 'camera'">
              <NText>{{ selectedReceiver.make }} {{ selectedReceiver.model }}</NText>
            </template>
            <template v-else-if="selectedReceiver.receiverTypeCode === 'interchangeable_back'">
              <NText>{{ selectedReceiver.name }} · {{ selectedReceiver.system }}</NText>
            </template>
            <template v-else>
              <NText>{{ selectedReceiver.name }} · {{ selectedReceiver.brand }} · {{ selectedReceiver.holderTypeCode }}
              </NText>
              <NDataTable :columns="[
                { title: 'Side', key: 'sideNumber' },
                { title: 'Slot State', key: 'slotStateCode' },
                { title: 'Loaded Film', key: 'loadedFilmId' }
              ]" :data="receiverStore.currentSlots" :row-key="(row) => row.id" />
            </template>
          </NFlex>
        </template>
        <NEmpty v-else description="Select a receiver to see its detail" />
      </NCard>
    </NGridItem>
  </NGrid>

  <NDrawer v-model:show="isCreateDrawerOpen" placement="right" width="440">
    <NDrawerContent title="Add receiver" closable>
      <NForm label-placement="top">
        <NFormItem label="Receiver type">
          <NSelect v-model:value="createForm.receiverTypeCode" :options="receiverTypeOptions" />
        </NFormItem>
        <NFormItem label="Film format">
          <NSelect v-model:value="createForm.filmFormatId" :options="filmFormatOptions" />
        </NFormItem>
        <NFormItem label="Frame size">
          <NInput v-model:value="createForm.frameSize" placeholder="36x24, 6x7, 4x5" />
        </NFormItem>

        <template v-if="createForm.receiverTypeCode === 'camera'">
          <NFormItem label="Make">
            <NInput v-model:value="createForm.make" />
          </NFormItem>
          <NFormItem label="Model">
            <NInput v-model:value="createForm.model" />
          </NFormItem>
          <NFormItem label="Serial number">
            <NInput v-model:value="createForm.serialNumber" />
          </NFormItem>
          <NFormItem label="Date acquired">
            <NDatePicker v-model:value="cameraDateAcquiredTimestamp" type="datetime" clearable />
          </NFormItem>
        </template>

        <template v-if="createForm.receiverTypeCode === 'interchangeable_back'">
          <NFormItem label="Name">
            <NInput v-model:value="createForm.name" />
          </NFormItem>
          <NFormItem label="System">
            <NInput v-model:value="createForm.system" />
          </NFormItem>
        </template>

        <template v-if="createForm.receiverTypeCode === 'film_holder'">
          <NFormItem label="Name">
            <NInput v-model:value="createForm.name" />
          </NFormItem>
          <NFormItem label="Brand">
            <NInput v-model:value="createForm.brand" />
          </NFormItem>
          <NFormItem label="Holder type">
            <NSelect v-model:value="createForm.holderTypeId" :options="holderTypeOptions" />
          </NFormItem>
        </template>

        <NFlex justify="end">
          <NButton tertiary @click="isCreateDrawerOpen = false">Cancel</NButton>
          <NButton type="primary" @click="submitCreateReceiver">Create receiver</NButton>
        </NFlex>
      </NForm>
    </NDrawerContent>
  </NDrawer>

  <NDrawer v-model:show="isEditDrawerOpen" placement="right" width="440">
    <NDrawerContent title="Edit receiver" closable>
      <NForm v-if="receiverStore.currentReceiver" label-placement="top">
        <NFormItem label="Film format">
          <NSelect v-model:value="editForm.filmFormatId" :options="filmFormatOptions" />
        </NFormItem>
        <NFormItem label="Frame size">
          <NInput v-model:value="editForm.frameSize" />
        </NFormItem>

        <template v-if="receiverStore.currentReceiver.receiverTypeCode === 'camera'">
          <NFormItem label="Make">
            <NInput v-model:value="editForm.make" />
          </NFormItem>
          <NFormItem label="Model">
            <NInput v-model:value="editForm.model" />
          </NFormItem>
          <NFormItem label="Serial number">
            <NInput v-model:value="editForm.serialNumber" />
          </NFormItem>
          <NFormItem label="Date acquired">
            <NDatePicker v-model:value="editCameraDateAcquiredTimestamp" type="datetime" clearable />
          </NFormItem>
        </template>

        <template v-if="receiverStore.currentReceiver.receiverTypeCode === 'interchangeable_back'">
          <NFormItem label="Name">
            <NInput v-model:value="editForm.name" />
          </NFormItem>
          <NFormItem label="System">
            <NInput v-model:value="editForm.system" />
          </NFormItem>
        </template>

        <template v-if="receiverStore.currentReceiver.receiverTypeCode === 'film_holder'">
          <NFormItem label="Name">
            <NInput v-model:value="editForm.name" />
          </NFormItem>
          <NFormItem label="Brand">
            <NInput v-model:value="editForm.brand" />
          </NFormItem>
          <NFormItem label="Holder type">
            <NSelect v-model:value="editForm.holderTypeId" :options="holderTypeOptions" />
          </NFormItem>
        </template>

        <NFlex justify="end">
          <NButton tertiary @click="isEditDrawerOpen = false">Cancel</NButton>
          <NButton type="primary" @click="submitEditReceiver">Save changes</NButton>
        </NFlex>
      </NForm>
    </NDrawerContent>
  </NDrawer>
</template>
