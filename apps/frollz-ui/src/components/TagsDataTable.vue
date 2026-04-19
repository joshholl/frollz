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
import type { Tag } from "@/types";

interface Props {
  tags: Tag[];
  isLoading: boolean;
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: number) => void;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
});

const columnHelper = createColumnHelper<Tag>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("colorCode", {
    header: "Color",
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
  }),
];

const pageIndex = ref(0);

const table = computed(() =>
  useVueTable({
    get data() {
      return props.tags;
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
        <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
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
        <template v-if="tags.length === 0">
          <TableRow>
            <TableCell colspan="3" class="text-center py-8 text-sm text-gray-600 dark:text-gray-400 italic">
              No tags found.
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow v-for="row in getRowModel().rows" :key="row.original.id">
            <TableCell class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              {{ row.original.name }}
            </TableCell>
            <TableCell class="px-6 py-4 whitespace-nowrap">
              <div class="w-8 h-8 rounded" :style="{ backgroundColor: row.original.colorCode }"
                :title="row.original.colorCode"></div>
            </TableCell>
            <TableCell class="px-6 py-4 whitespace-nowrap text-right space-x-2">
              <button @click="onEdit(row.original)"
                class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Edit
              </button>
              <button @click="onDelete(row.original.id)"
                class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
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
