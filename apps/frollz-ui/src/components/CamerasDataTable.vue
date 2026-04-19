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
import type { Camera } from "@frollz/shared";

interface Props {
  cameras: Camera[];
  isLoading: boolean;
  statusLabel: (status: Camera["status"]) => string;
  statusClass: (status: Camera["status"]) => string;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 20,
});

defineEmits<{
  edit: [camera: Camera];
  delete: [camera: Camera];
}>();

const columnHelper = createColumnHelper<Camera>();

const columns = [
  columnHelper.accessor((row) => `${row.brand} ${row.model}`, {
    id: "camera",
    header: "Camera",
  }),
  columnHelper.accessor("status", {
    header: "Status",
  }),
  columnHelper.accessor("acceptedFormats", {
    header: "Formats",
  }),
];

const pageIndex = ref(0);

const table = computed(() =>
  useVueTable({
    get data() {
      return props.cameras;
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
    <template v-if="isLoading">
      <div v-for="n in 5" :key="n"
        class="flex px-6 py-4 border-b border-gray-200 dark:border-gray-700 animate-pulse gap-4">
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 flex-1"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    </template>
    <Table v-else>
      <TableHeader class="bg-gray-50 dark:bg-gray-700">
        <TableRow v-for="headerGroup in getHeaderGroups()" :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id"
            class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {{ header.column.columnDef.header }}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody class="divide-y divide-gray-200 dark:divide-gray-700">
        <template v-if="cameras.length === 0">
          <TableRow>
            <TableCell colspan="3" class="text-center py-8 text-sm text-gray-600 dark:text-gray-400 italic">
              No cameras found.
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow v-for="row in getRowModel().rows" :key="row.original.id">
            <TableCell class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <RouterLink :to="{ name: 'camera-detail', params: { id: row.original.id } }"
                class="text-primary-600 dark:text-primary-400 hover:underline">
                {{ row.original.brand }} {{ row.original.model }}
              </RouterLink>
              <span v-if="row.original.serialNumber" class="block text-xs text-gray-400 dark:text-gray-500">
                #{{ row.original.serialNumber }}
              </span>
            </TableCell>
            <TableCell class="px-6 py-4 whitespace-nowrap">
              <span :class="statusClass(row.original.status)">
                {{ statusLabel(row.original.status) }}
              </span>
            </TableCell>
            <TableCell class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[200px]">
              {{row.original.acceptedFormats.map(af => af.format?.name ?? `Format ${af.formatId}`).join(", ") || "—"}}
            </TableCell>
            <TableCell class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
              {{ row.original.notes ?? "—" }}
            </TableCell>
            <TableCell class="px-6 py-4 whitespace-nowrap text-right space-x-2">
              <button @click="$emit('edit', row.original)"
                class="px-3 py-2 min-h-[44px] text-xs font-medium text-primary-600 dark:text-primary-400 border border-primary-300 dark:border-primary-600 rounded hover:bg-primary-50 dark:hover:bg-primary-900/30">
                Edit
              </button>
              <button @click="$emit('delete', row.original)"
                class="px-3 py-2 min-h-[44px] text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30">
                Delete
              </button>
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>

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
