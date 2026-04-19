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
import type { Emulsion, Tag } from "@/types";

interface Props {
  emulsions: Emulsion[];
  isLoading: boolean;
  sortField: string;
  sortDirection: "asc" | "desc";
  formatNameById: Record<number, string>;
  processNameById: Record<number, string>;
  emulsionTagMap: Record<number, Tag[]>;
  onSort: (field: string) => void;
  onFilter: (field: string, label: string, value: string) => void;
  onAddFilm: (emulsionId: number) => void;
  boxImageSrc: (emulsion: Emulsion) => string;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 20,
});

const columnHelper = createColumnHelper<Emulsion>();

const columns = [
  columnHelper.accessor("brand", {
    header: "Brand",
  }),
  columnHelper.accessor("manufacturer", {
    header: "Manufacturer",
  }),
  columnHelper.accessor("formatId", {
    header: "Format",
  }),
  columnHelper.accessor("processId", {
    header: "Process",
  }),
  columnHelper.accessor("speed", {
    header: "Speed",
  }),
  columnHelper.accessor("id", {
    id: "tags",
    header: "Tags",
  }),
  columnHelper.accessor("id", {
    id: "image",
    header: "Image",
  }),
  columnHelper.display({
    id: "actions",
    header: "",
  }),
];

const pageIndex = ref(0);

const table = computed(() =>
  useVueTable({
    get data() {
      return props.emulsions;
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


defineEmits<{
  sort: [field: string];
  filter: [field: string, label: string, value: string];
  addFilm: [emulsionId: number];
}>();
</script>

<template>
  <div class="overflow-x-auto">
    <!-- Skeleton loader -->
    <template v-if="isLoading">
      <div v-for="n in 5" :key="n"
        class="flex px-6 py-4 border-b border-gray-200 dark:border-gray-700 animate-pulse gap-4">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 flex-1"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </template>

    <!-- Table -->
    <Table v-else>
      <TableHeader class="bg-gray-50 dark:bg-gray-700">
        <TableRow v-for="headerGroup in getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id" :class="[
            'text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
            ['brand', 'manufacturer', 'speed'].includes(header.column.id)
              ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-600'
              : '',
            sortField === header.column.id ? 'bg-gray-200 dark:bg-gray-600' : '',
          ]" @click="
            () => {
              if (['brand', 'manufacturer', 'speed'].includes(header.column.id)) {
                onSort(header.column.id);
              }
            }
          ">
            <div class="flex items-center gap-2">
              {{ header.column.columnDef.header }}
              <span v-if="sortField === header.column.id" class="text-xs">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody class="divide-y divide-gray-200 dark:divide-gray-700">
        <template v-if="emulsions.length === 0">
          <TableRow>
            <TableCell colspan="8" class="text-center py-8 text-sm text-gray-600 dark:text-gray-400 italic">
              No emulsions found.
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow v-for="row in getRowModel().rows" :key="row.original.id">
            <!-- Brand -->
            <TableCell
              class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
              @click="onFilter('brand', 'Brand', row.original.brand)">
              {{ row.original.brand }}
            </TableCell>

            <!-- Manufacturer -->
            <TableCell
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
              @click="
                onFilter('manufacturer', 'Manufacturer', row.original.manufacturer)
                ">
              {{ row.original.manufacturer }}
            </TableCell>

            <!-- Format -->
            <TableCell class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatNameById[row.original.formatId] ?? "—" }}
            </TableCell>

            <!-- Process -->
            <TableCell class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {{ processNameById[row.original.processId] ?? "—" }}
              </span>
            </TableCell>

            <!-- Speed -->
            <TableCell
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:text-primary-600 dark:hover:text-primary-400"
              @click="onFilter('speed', 'Speed', String(row.original.speed))">
              ISO {{ row.original.speed }}
            </TableCell>

            <!-- Tags -->
            <TableCell class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex flex-wrap gap-1">
                <span v-for="tag in emulsionTagMap[row.original.id]" :key="tag.id"
                  class="px-2 py-1 rounded text-xs font-medium text-white" :style="{ backgroundColor: tag.colorCode }">
                  {{ tag.name }}
                </span>
              </div>
            </TableCell>

            <!-- Image -->
            <TableCell class="px-6 py-4 whitespace-nowrap">
              <img :src="boxImageSrc(row.original)" :alt="row.original.boxImageMimeType ? 'Box image' : 'Placeholder'
                " class="w-12 h-12 object-contain rounded" />
            </TableCell>

            <!-- Actions -->
            <TableCell class="px-6 py-4 whitespace-nowrap text-right">
              <button @click="onAddFilm(row.original.id)"
                class="bg-primary-600 text-white px-4 py-2 min-h-[44px] rounded-md hover:bg-primary-700 font-medium"
                title="Add film from this emulsion" aria-label="Add film from this emulsion">
                Add Film
              </button>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>

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
