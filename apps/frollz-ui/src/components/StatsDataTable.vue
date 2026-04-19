<script setup lang="ts">
import { computed, ref } from "vue";
import { createColumnHelper, getCoreRowModel, getPaginationRowModel, useVueTable } from "@tanstack/vue-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { TransitionDuration } from "@frollz/shared";

interface Props {
  durations: TransitionDuration[];
  isLoading: boolean;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 20,
});

const columnHelper = createColumnHelper<TransitionDuration>();

const columns = [
  columnHelper.accessor("transition", {
    header: "Transition",
  }),
  columnHelper.accessor("avgDays", {
    header: "Avg. Days",
  }),
];

const pageIndex = ref(0);

const table = computed(() =>
  useVueTable({
    get data() {
      return props.durations;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      get pagination() {
        return {
          pageIndex: pageIndex.value,
          pageSize: props.pageSize,
        };
      },
    },
  })
);

const { getHeaderGroups, getRowModel } = table.value;

const pageCount = computed(() => table.value.getPageCount());
const currentPage = computed(() => pageIndex.value + 1);

</script>

<template>
  <div class="overflow-x-auto">
    <!-- Skeleton loader -->
    <template v-if="isLoading">
      <div v-for="n in 4" :key="n" class="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse mb-3" />
    </template>

    <!-- Table -->
    <Table v-else>
      <TableHeader>
        <TableRow class="border-b border-gray-100 dark:border-gray-700">
          <TableHead v-for="header in getHeaderGroups()[0]?.headers" :key="header.id" :class="[
            'px-6 py-3 font-semibold text-gray-700 dark:text-gray-300',
            header.column.id === 'avgDays' ? 'text-right' : '',
          ]">
            {{ header.column.columnDef.header }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="durations.length === 0">
          <TableRow>
            <TableCell colspan="2" class="px-6 py-8 text-center text-sm text-gray-600 dark:text-gray-400">
              No completed transitions recorded yet.
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow v-for="row in getRowModel().rows" :key="row.original.transition"
            class="border-b border-gray-50 dark:border-gray-700/50 last:border-b-0">
            <TableCell class="px-6 py-3 text-gray-800 dark:text-gray-200">
              {{ row.original.transition }}
            </TableCell>
            <TableCell class="px-6 py-3 text-right font-mono">
              <span v-if="row.original.avgDays !== null" class="text-gray-800 dark:text-gray-200">
                {{ row.original.avgDays.toFixed(1) }}
              </span>
              <span v-else class="text-gray-400 dark:text-gray-500">N/A</span>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>

    <!-- Pagination -->
    <Pagination v-if="pageCount > 1" :items-per-page="props.pageSize" class="mt-4">
      <PaginationContent class="flex gap-x-6">
        <PaginationItem :value="currentPage - 1">
          <PaginationPrevious :disabled="currentPage === 1" @click="pageIndex = Math.max(0, pageIndex - 1)" />
        </PaginationItem>
        <PaginationItem :value="currentPage + 1">
          <PaginationNext :disabled="currentPage === pageCount"
            @click="pageIndex = Math.min(pageCount - 1, pageIndex + 1)" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
</template>
