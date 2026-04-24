<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import {
  NAlert,
  NButton,
  NCard,
  NEmpty,
  NFlex,
  NInput,
  NSelect,
  NTag,
  NText
} from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import type { FilmSummary } from '@frollz2/schema';
import { useReferenceStore } from '../stores/reference.js';
import { useFilmStore } from '../stores/film.js';
import PageShell from '../components/PageShell.vue';
import InventorySplitLayout from '../components/inventory/InventorySplitLayout.vue';
import EntityTablePanel from '../components/inventory/EntityTablePanel.vue';
import KpiCardGrid from '../components/inventory/KpiCardGrid.vue';
import FilmCreateDrawer from '../components/film/FilmCreateDrawer.vue';
import { useUiFeedback } from '../composables/useUiFeedback.js';
import { usePagedEntityTable } from '../composables/usePagedEntityTable.js';
import {
  buildChildKpis,
  FILM_EXPIRING_SOON_DAYS,
  filterAndSortFilmsForChildTable,
  filterFilmsByFormatCodes
} from './film-dashboard.js';

type FilmStatsCard = {
  label: string;
  value: number;
  helper: string;
};

const referenceStore = useReferenceStore();
const filmStore = useFilmStore();
const router = useRouter();
const route = useRoute();
const feedback = useUiFeedback();

const isCreateDrawerOpen = ref(false);
const childStateFilter = ref<string | null>(null);
const childSearchTerm = ref('');

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

const lockedFilmFormatCodes = computed<string[]>(() => {
  if (!Array.isArray(route.meta.filmFormatFilters)) {
    return [];
  }

  return route.meta.filmFormatFilters.filter((code): code is string => typeof code === 'string');
});

const isLockedBreakout = computed(() => lockedFilmFormatCodes.value.length > 0);

const pageSubtitle = computed(() =>
  isLockedBreakout.value
    ? 'Domain view for this film format with searchable table and inventory KPIs.'
    : 'Film inventory dashboard with the latest rolls and key status counts.'
);

const displayedFilms = computed(() => {
  return filterFilmsByFormatCodes(filmStore.films, lockedFilmFormatCodes.value);
});

const recentFilms = computed(() => displayedFilms.value.slice(-10));

const parentStats = computed<FilmStatsCard[]>(() => [
  { label: 'Total visible films', value: displayedFilms.value.length, helper: 'Current route scope' },
  {
    label: 'Loaded films',
    value: displayedFilms.value.filter((film) => film.currentStateCode === 'loaded').length,
    helper: 'Currently loaded in devices'
  },
  {
    label: 'Exposed films',
    value: displayedFilms.value.filter((film) => film.currentStateCode === 'exposed').length,
    helper: 'Awaiting next transition'
  },
  {
    label: 'Sent for development',
    value: displayedFilms.value.filter((film) => film.currentStateCode === 'sent_for_dev').length,
    helper: 'In lab processing stage'
  }
]);

const childFilteredFilms = computed(() => {
  return filterAndSortFilmsForChildTable(displayedFilms.value, childStateFilter.value, childSearchTerm.value);
});

const childTableState = usePagedEntityTable({
  rows: childFilteredFilms,
  resetPageOn: [childStateFilter, childSearchTerm, () => route.path],
  initialPageSize: 10
});

const childKpis = computed<FilmStatsCard[]>(() => {
  return buildChildKpis(displayedFilms.value, Date.now(), FILM_EXPIRING_SOON_DAYS);
});

const childStateFilterOptions = computed(() => [
  { label: 'All states', value: '__all__' },
  ...referenceStore.filmStates.map((state) => ({ label: state.label, value: state.code }))
]);

const childTableColumns = computed<DataTableColumns<FilmSummary>>(() => [
  {
    title: 'Name',
    key: 'name',
    render: (row) => h(
      RouterLink,
      {
        to: `/film/${row.id}`,
        class: 'film-table__name-link',
        style: {
          color: 'var(--n-primary-color)',
          fontWeight: 600,
          textDecorationColor: 'var(--n-primary-color)'
        },
        'data-testid': `film-row-link-${row.id}`
      },
      { default: () => row.name }
    )
  },
  {
    title: 'State',
    key: 'state',
    render: (row) => h(
      NTag,
      {
        type: stateTypeByCode[row.currentStateCode] ?? 'default',
        size: 'small'
      },
      { default: () => row.currentState.label }
    )
  },
  {
    title: 'Emulsion',
    key: 'emulsion',
    render: (row) => `${row.emulsion.manufacturer} ${row.emulsion.brand} · ISO ${row.emulsion.isoSpeed}`
  }
]);

async function refresh(): Promise<void> {
  try {
    await filmStore.loadFilms();
  } catch (error) {
    feedback.error(feedback.toErrorMessage(error, 'Could not refresh film inventory.'));
  }
}

onMounted(async () => {
  try {
    if (!referenceStore.loaded) {
      await referenceStore.loadAll();
    }
    await refresh();
  } catch (error) {
    feedback.error(feedback.toErrorMessage(error, 'Could not load film inventory.'));
  }
});

function onChildStateFilterChange(value: string | null): void {
  childStateFilter.value = value === '__all__' ? null : value;
}

function openCreateDrawer(): void {
  isCreateDrawerOpen.value = true;
}
</script>

<template>
  <PageShell title="Film Inventory" :subtitle="pageSubtitle">
    <template #actions>
      <NButton type="primary" @click="openCreateDrawer">Add film</NButton>
      <NButton tertiary @click="refresh">Refresh</NButton>
    </template>

    <InventorySplitLayout
      :left-panel-title="isLockedBreakout ? 'Films in this format' : 'Recently added films'"
      :right-panel-title="isLockedBreakout ? 'Format KPIs' : 'Film statistics'"
    >
      <template #left>
        <NCard :loading="filmStore.isLoading">
          <NAlert v-if="filmStore.filmsError" type="error" :show-icon="true" style="margin-bottom: 10px;">
            {{ filmStore.filmsError }}
          </NAlert>

          <EntityTablePanel
            v-if="isLockedBreakout"
            :columns="childTableColumns"
            :data="childTableState.pagedRows.value"
            :loading="filmStore.isLoading"
            :row-key="(row) => row.id"
            :page="childTableState.page.value"
            :page-size="childTableState.pageSize.value"
            :item-count="childTableState.totalRows.value"
            :page-sizes="childTableState.pageSizes"
            empty-description="No films match the current filters."
            table-test-id="film-child-table"
            pagination-test-id="film-child-pagination"
            @update:page="(value) => { childTableState.page.value = value; }"
            @update:page-size="(value) => { childTableState.pageSize.value = value; }"
          >
            <template #filters>
              <NSelect
                :value="childStateFilter ?? '__all__'"
                :options="childStateFilterOptions"
                style="min-width: 200px;"
                data-testid="film-child-state-filter"
                @update:value="onChildStateFilterChange"
              />
              <NInput
                v-model:value="childSearchTerm"
                clearable
                placeholder="Search by film or emulsion"
                data-testid="film-child-search"
              />
            </template>
          </EntityTablePanel>

          <template v-else>
            <NEmpty
              v-if="!filmStore.isLoading && !filmStore.filmsError && recentFilms.length === 0"
              description="No films are available yet."
            />
            <NFlex v-else vertical size="small">
              <NCard v-for="film in recentFilms" :key="film.id" size="small" embedded>
                <NFlex justify="space-between" align="center" :wrap="false">
                  <NText strong>{{ film.name }}</NText>
                  <NTag :type="stateTypeByCode[film.currentStateCode] ?? 'default'" size="small">
                    {{ film.currentState.label }}
                  </NTag>
                </NFlex>
                <NText depth="3">{{ film.emulsion.manufacturer }} {{ film.emulsion.brand }} · ISO {{ film.emulsion.isoSpeed }}</NText>
                <NText depth="3">{{ film.filmFormat.code }} · {{ film.packageType.label }}</NText>
                <NFlex justify="end">
                  <NButton tertiary size="small" @click="router.push(`/film/${film.id}`)">Open timeline</NButton>
                </NFlex>
              </NCard>
            </NFlex>
          </template>
        </NCard>
      </template>

      <template #right>
        <KpiCardGrid :cards="isLockedBreakout ? childKpis : parentStats" />
      </template>
    </InventorySplitLayout>
  </PageShell>

  <FilmCreateDrawer v-model:show="isCreateDrawerOpen" />
</template>

<style scoped>
.film-table__name-link {
  color: var(--n-primary-color);
  text-decoration: none;
}

.film-table__name-link:hover {
  text-decoration: underline;
}

.film-table__name-link:visited {
  color: var(--n-primary-color);
}

.film-table__name-link:focus-visible {
  border-radius: 4px;
  outline: 2px solid var(--n-primary-color);
  outline-offset: 2px;
}
</style>
