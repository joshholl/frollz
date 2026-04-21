<script setup lang="ts">
import { computed, h, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
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
import type { FilmCreateRequest, FilmListQuery, FilmSummary } from '@frollz2/schema';
import { useReferenceStore } from '../stores/reference.js';
import { useFilmStore } from '../stores/film.js';

const referenceStore = useReferenceStore();
const filmStore = useFilmStore();
const router = useRouter();

const isCreateDrawerOpen = ref(false);
const expirationTimestamp = ref<number | null>(null);

const filters = reactive<{
  stateCode: string | null;
  filmFormatId: number | null;
  emulsionId: number | null;
}>({
  stateCode: null,
  filmFormatId: null,
  emulsionId: null
});

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

const stateTypeByCode: Record<string, 'default' | 'info' | 'primary' | 'warning' | 'success'> = {
  purchased: 'default',
  stored: 'info',
  loaded: 'primary',
  exposed: 'warning',
  removed: 'warning',
  sent_for_dev: 'info',
  developed: 'success',
  scanned: 'success',
  archived: 'default'
};

const columns = computed<DataTableColumns<FilmSummary>>(() => [
  { title: 'Name', key: 'name' },
  {
    title: 'Emulsion',
    key: 'emulsion',
    render: (row) => row.emulsion.brand
  },
  {
    title: 'Format',
    key: 'filmFormat',
    render: (row) => row.filmFormat.code
  },
  {
    title: 'Package',
    key: 'packageType',
    render: (row) => row.packageType.code
  },
  {
    title: 'State',
    key: 'currentStateCode',
    render: (row) => h(NTag, { type: stateTypeByCode[row.currentStateCode] ?? 'default' }, { default: () => row.currentState.label })
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (row) => h(NSpace, null, {
      default: () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => {
              void router.push(`/film/${row.id}`);
            }
          },
          { default: () => 'View detail' }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => {
              void router.push(`/film/${row.id}`);
            }
          },
          { default: () => 'Add event' }
        ),
        h(
          NPopconfirm,
          {
            onPositiveClick: () => {
              void filmStore.deleteFilm(row.id);
            }
          },
          {
            trigger: () => h(NButton, { size: 'small', type: 'error', secondary: true }, { default: () => 'Delete' }),
            default: () => 'Delete this film?'
          }
        )
      ]
    })
  }
]);

const stateOptions = computed(() =>
  referenceStore.filmStates.map((state) => ({ label: state.label, value: state.code }))
);
const formatOptions = computed(() =>
  referenceStore.filmFormats.map((format) => ({ label: format.label, value: format.id }))
);
const emulsionOptions = computed(() =>
  referenceStore.emulsions.map((emulsion) => ({
    label: `${emulsion.manufacturer} ${emulsion.brand} ${emulsion.isoSpeed}`,
    value: emulsion.id
  }))
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

onMounted(async () => {
  if (!referenceStore.loaded) {
    await referenceStore.loadAll();
  }
  await filmStore.loadFilms();
});

async function refresh(): Promise<void> {
  await filmStore.loadFilms(buildQuery());
}

function buildQuery(): FilmListQuery {
  return {
    ...(filters.stateCode ? { stateCode: filters.stateCode } : {}),
    ...(filters.filmFormatId ? { filmFormatId: filters.filmFormatId } : {}),
    ...(filters.emulsionId ? { emulsionId: filters.emulsionId } : {})
  };
}

async function applyFilters(): Promise<void> {
  await refresh();
}

function resetFilters(): void {
  filters.stateCode = null;
  filters.filmFormatId = null;
  filters.emulsionId = null;
  void refresh();
}

function resetCreateForm(): void {
  createForm.name = '';
  createForm.emulsionId = null;
  createForm.filmFormatId = null;
  createForm.packageTypeId = null;
  expirationTimestamp.value = null;
}

async function submitCreateFilm(): Promise<void> {
  if (!createForm.name || !createForm.emulsionId || !createForm.filmFormatId || !createForm.packageTypeId) {
    return;
  }

  const payload: FilmCreateRequest = {
    name: createForm.name,
    emulsionId: createForm.emulsionId,
    filmFormatId: createForm.filmFormatId,
    packageTypeId: createForm.packageTypeId,
    expirationDate: expirationTimestamp.value ? new Date(expirationTimestamp.value).toISOString() : null
  };

  await filmStore.createFilm(payload);
  isCreateDrawerOpen.value = false;
  resetCreateForm();
  await refresh();
}
</script>

<template>
  <NGrid cols="1" y-gap="16">
    <NGridItem>
      <NCard title="Film inventory">
        <NFlex vertical size="medium">
          <NText>Current films for the authenticated user.</NText>
          <NGrid cols="1 1 3" x-gap="12" y-gap="12">
            <NGridItem>
              <NSelect v-model:value="filters.stateCode" :options="stateOptions" clearable
                placeholder="Filter by state" />
            </NGridItem>
            <NGridItem>
              <NSelect v-model:value="filters.filmFormatId" :options="formatOptions" clearable
                placeholder="Filter by format" />
            </NGridItem>
            <NGridItem>
              <NSelect v-model:value="filters.emulsionId" :options="emulsionOptions" clearable filterable
                placeholder="Filter by emulsion" />
            </NGridItem>
          </NGrid>
          <NFlex justify="space-between" align="center">
            <NSpace>
              <NButton tertiary @click="applyFilters">Apply filters</NButton>
              <NButton tertiary @click="resetFilters">Reset filters</NButton>
            </NSpace>
            <NSpace>
              <NButton type="primary" @click="isCreateDrawerOpen = true">Add film</NButton>
              <NButton tertiary @click="refresh">Refresh</NButton>
            </NSpace>
          </NFlex>
          <NDataTable :columns="columns" :data="filmStore.films" :loading="filmStore.isLoading"
            :row-key="(row) => row.id" />
          <NEmpty v-if="filmStore.films.length === 0" description="No films found" />
        </NFlex>
      </NCard>
    </NGridItem>
  </NGrid>

  <NDrawer v-model:show="isCreateDrawerOpen" placement="right" width="420">
    <NDrawerContent title="Add film" closable>
      <NForm label-placement="top">
        <NFormItem label="Name">
          <NInput v-model:value="createForm.name" placeholder="Film label" />
        </NFormItem>
        <NFormItem label="Emulsion">
          <NSelect v-model:value="createForm.emulsionId" :options="emulsionOptions" filterable
            placeholder="Select emulsion" />
        </NFormItem>
        <NFormItem label="Film format">
          <NSelect v-model:value="createForm.filmFormatId" :options="formatOptions" placeholder="Select format"
            @update:value="createForm.packageTypeId = null" />
        </NFormItem>
        <NFormItem label="Package type">
          <NSelect v-model:value="createForm.packageTypeId" :options="packageTypeOptions"
            placeholder="Select package" />
        </NFormItem>
        <NFormItem label="Expiration date">
          <NDatePicker v-model:value="expirationTimestamp" type="datetime" clearable />
        </NFormItem>
        <NFlex justify="end">
          <NButton tertiary @click="isCreateDrawerOpen = false">Cancel</NButton>
          <NButton type="primary" @click="submitCreateFilm">Create film</NButton>
        </NFlex>
      </NForm>
    </NDrawerContent>
  </NDrawer>
</template>
