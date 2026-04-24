<script setup lang="ts" generic="TRow extends Record<string, unknown>">
import { NCard } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import EntityTablePanel from './EntityTablePanel.vue';

type RowKey = string | number;

const props = withDefaults(defineProps<{
  columns: DataTableColumns<TRow>;
  data: TRow[];
  loading?: boolean;
  rowKey: (row: TRow) => RowKey;
  page: number;
  pageSize: number;
  itemCount: number;
  pageSizes?: number[];
  showSizePicker?: boolean;
  emptyDescription?: string;
  tableTestId?: string;
  paginationTestId?: string;
}>(), {
  loading: false,
  pageSizes: () => [10, 25, 50],
  showSizePicker: true,
  emptyDescription: 'No matching records found.',
  tableTestId: '',
  paginationTestId: ''
});

const emit = defineEmits<{
  'update:page': [value: number];
  'update:pageSize': [value: number];
}>();
</script>

<template>
  <NCard :loading="loading">
    <slot name="before" />

    <EntityTablePanel
      :columns="columns"
      :data="data"
      :loading="loading"
      :row-key="rowKey"
      :page="page"
      :page-size="pageSize"
      :item-count="itemCount"
      :page-sizes="pageSizes"
      :show-size-picker="showSizePicker"
      :empty-description="emptyDescription"
      :table-test-id="tableTestId"
      :pagination-test-id="paginationTestId"
      @update:page="(value) => emit('update:page', value)"
      @update:page-size="(value) => emit('update:pageSize', value)"
    >
      <template v-if="$slots.filters" #filters>
        <slot name="filters" />
      </template>
    </EntityTablePanel>
  </NCard>
</template>
