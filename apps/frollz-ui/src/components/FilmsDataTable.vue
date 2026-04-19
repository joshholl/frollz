<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { createColumnHelper, getCoreRowModel, getPaginationRowModel, useVueTable } from "@tanstack/vue-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Film } from "@frollz/shared";
import type { Camera } from "@frollz/shared";
import { getScanUrls, currentStateName } from "@/types";
import { getStateColor } from "@/utils/stateColors";

interface Props {
  films: Film[];
  isLoading: boolean;
  loadedCameraByFilmId?: Map<number, Camera>;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  loadedCameraByFilmId: () => new Map(),
  pageSize: 20,
});

const columnHelper = createColumnHelper<Film>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor((row) => row.emulsion?.brand ?? "—", {
    id: "emulsion",
    header: "Emulsion",
  }),
  columnHelper.accessor((row) => currentStateName(row), {
    id: "state",
    header: "State",
  }),
  columnHelper.accessor((row) => {
    const camera = props.loadedCameraByFilmId.get(row.id);
    return camera ? `${camera.brand} ${camera.model}` : "—";
  }, {
    id: "camera",
    header: "Camera",
  }),
  columnHelper.accessor((row) => getScanUrls(row).length, {
    id: "scans",
    header: "Scans",
  }),
];

const pageIndex = ref(0);

const table = computed(() =>
  useVueTable({
    get data() {
      return props.films;
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
      <div v-for="n in 5" :key="n"
        class="flex px-6 py-4 border-b border-gray-200 dark:border-gray-700 animate-pulse gap-6">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 flex-1"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36"></div>
        <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
      </div>
    </template>

    <!-- Table -->
    <Table v-else>
      <TableHeader class="bg-gray-50 dark:bg-gray-700">
        <TableRow v-for="headerGroup in getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id"
            class="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none">
            {{ header.column.columnDef.header }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody class="divide-y divide-gray-200 dark:divide-gray-700">
        <template v-if="films.length === 0">
          <TableRow>
            <TableCell colspan="5" class="text-center py-8 text-sm text-gray-600 dark:text-gray-400 italic">
              No films found.
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow v-for="row in getRowModel().rows" :key="row.id">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id" class="text-sm whitespace-nowrap">
              <!-- Name column with link -->
              <template v-if="cell.column.id === 'name'">
                <RouterLink :to="{ name: 'film-detail', params: { key: row.original.id } }"
                  class="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  {{ cell.getValue() }}
                </RouterLink>
              </template>

              <!-- State column with badge -->
              <template v-else-if="cell.column.id === 'state'">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  getStateColor(cell.getValue() as string),
                ]">
                  {{ cell.getValue() || "No state" }}
                </span>
              </template>

              <!-- Scans column with links -->
              <template v-else-if="cell.column.id === 'scans'">
                <template v-if="(cell.getValue() as number) > 0">
                  <template v-if="(cell.getValue() as number) === 1">
                    <a :href="getScanUrls(row.original)[0]" target="_blank" rel="noopener noreferrer"
                      :aria-label="`1 scan link`" data-testid="scan-indicator"
                      class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ cell.getValue() }}
                    </a>
                  </template>
                  <template v-else>
                    <RouterLink :to="{ name: 'film-detail', params: { key: row.original.id } }"
                      :aria-label="`${cell.getValue()} scan links`" data-testid="scan-indicator"
                      class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ cell.getValue() }}
                    </RouterLink>
                  </template>
                </template>
              </template>

              <!-- Default columns -->
              <template v-else>
                {{ cell.getValue() }}
              </template>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>


    <!-- Removed broken PaginationRoot/PaginationList block -->

    <!-- Pagination -->
    <!-- Pagination (shadcn-vue, manual range) -->
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
