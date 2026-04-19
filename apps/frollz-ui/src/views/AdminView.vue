<template>
  <div class="max-w-2xl">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
      Admin
    </h1>
    <p class="text-gray-600 dark:text-gray-400 mb-8">
      Data management tools for import and export operations.
    </p>

    <!-- Export Films JSON -->
    <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Export Films
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Download all your films as a JSON file for backup or migration.
          </p>
        </div>
        <button
          @click="exportFilmsJson"
          :disabled="exportingJson"
          class="shrink-0 px-4 py-2 min-h-[40px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-50 transition-colors"
        >
          {{ exportingJson ? "Exporting…" : "Export" }}
        </button>
      </div>
    </div>

    <!-- Export Library -->
    <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Export Library
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Download your library (emulsions, formats, tags) as JSON for sharing or backup.
          </p>
        </div>
        <button
          @click="exportLibraryJson"
          :disabled="exportingLibrary"
          class="shrink-0 px-4 py-2 min-h-[40px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-50 transition-colors"
        >
          {{ exportingLibrary ? "Exporting…" : "Export" }}
        </button>
      </div>
    </div>

    <!-- Import CSV -->
    <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Import Films (CSV)
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Bulk import films from a CSV file using the provided template.
          </p>
        </div>
        <button
          @click="csvInput?.click()"
          :disabled="importingCsv"
          class="shrink-0 px-4 py-2 min-h-[40px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-50 transition-colors"
        >
          {{ importingCsv ? "Importing…" : "Import" }}
        </button>
      </div>
      <input
        ref="csvInput"
        type="file"
        accept=".csv,text/csv"
        class="hidden"
        aria-label="Select CSV file to import"
        @change="onCsvSelected"
      />
    </div>

    <!-- Import Library -->
    <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Import Library
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Import emulsions, formats, and tags from a previously exported library.json file.
          </p>
        </div>
        <button
          @click="libraryInput?.click()"
          :disabled="importingLibrary"
          class="shrink-0 px-4 py-2 min-h-[40px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-50 transition-colors"
        >
          {{ importingLibrary ? "Importing…" : "Import" }}
        </button>
      </div>
      <input
        ref="libraryInput"
        type="file"
        accept=".json,application/json"
        class="hidden"
        aria-label="Select library.json file to import"
        @change="onLibrarySelected"
      />
    </div>

    <!-- Import Films JSON -->
    <div class="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Import Films JSON
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Restore all films from a previously exported films.json file.
          </p>
        </div>
        <button
          @click="filmsJsonInput?.click()"
          :disabled="importingFilmsJson"
          class="shrink-0 px-4 py-2 min-h-[40px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 font-medium disabled:opacity-50 transition-colors"
        >
          {{ importingFilmsJson ? "Importing…" : "Import" }}
        </button>
      </div>
      <input
        ref="filmsJsonInput"
        type="file"
        accept=".json,application/json"
        class="hidden"
        aria-label="Select films.json file to import"
        @change="onFilmsJsonSelected"
      />
    </div>

    <!-- Import results (CSV) -->
    <div
      v-if="importResult"
      class="mb-4 rounded-md border p-4 text-sm"
      :class="
        importResult.errors.length
          ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700'
          : 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
      "
    >
      <div class="flex items-center justify-between mb-1">
        <span class="font-medium text-gray-800 dark:text-gray-200">
          CSV import complete — {{ importResult.imported }} imported,
          {{ importResult.skipped }} skipped
        </span>
        <button
          @click="importResult = null"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
        >
          &times;
        </button>
      </div>
      <ul
        v-if="importResult.errors.length"
        class="mt-2 space-y-1 text-yellow-800 dark:text-yellow-200"
      >
        <li v-for="err in importResult.errors" :key="err.row">
          Row {{ err.row }}: {{ err.reason }}
        </li>
      </ul>
      <p
        v-if="!importResult.errors.length"
        class="text-green-800 dark:text-green-200 mt-1"
      >
        All rows imported successfully.
        <a :href="importApi.templateUrl" class="underline">Download template</a>
        for next time.
      </p>
    </div>

    <!-- Import results (Library JSON) -->
    <div
      v-if="libraryImportResult"
      class="mb-4 rounded-md border p-4 text-sm"
      :class="
        libraryImportResult.errors.length
          ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700'
          : 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
      "
    >
      <div class="flex items-center justify-between mb-1">
        <span class="font-medium text-gray-800 dark:text-gray-200">
          Library import complete —
          {{ libraryImportResult.tags.imported }} tags,
          {{ libraryImportResult.formats.imported }} formats,
          {{ libraryImportResult.emulsions.imported }} emulsions imported
        </span>
        <button
          @click="libraryImportResult = null"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
        >
          &times;
        </button>
      </div>
      <ul
        v-if="libraryImportResult.errors.length"
        class="mt-2 space-y-1 text-yellow-800 dark:text-yellow-200"
      >
        <li
          v-for="err in libraryImportResult.errors"
          :key="`${err.entity}-${err.index}`"
        >
          {{ err.entity }} #{{ err.index }}: {{ err.reason }}
        </li>
      </ul>
    </div>

    <!-- Import results (Films JSON) -->
    <div
      v-if="filmsJsonImportResult"
      class="mb-4 rounded-md border p-4 text-sm"
      :class="
        filmsJsonImportResult.errors.length
          ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700'
          : 'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
      "
    >
      <div class="flex items-center justify-between mb-1">
        <span class="font-medium text-gray-800 dark:text-gray-200">
          Films JSON import complete —
          {{ filmsJsonImportResult.imported }} imported,
          {{ filmsJsonImportResult.skipped }} skipped
        </span>
        <button
          @click="filmsJsonImportResult = null"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none"
        >
          &times;
        </button>
      </div>
      <ul
        v-if="filmsJsonImportResult.errors.length"
        class="mt-2 space-y-1 text-yellow-800 dark:text-yellow-200"
      >
        <li v-for="err in filmsJsonImportResult.errors" :key="err.index">
          Film "{{ err.name }}": {{ err.reason }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { exportApi, importApi } from "@/services/api-client";
import { triggerDownload } from "@/utils/download";

const exportingJson = ref(false);
const exportingLibrary = ref(false);
const importingCsv = ref(false);
const csvInput = ref<HTMLInputElement | null>(null);
const importResult = ref<{
  imported: number;
  skipped: number;
  errors: { row: number; reason: string }[];
} | null>(null);

const importingLibrary = ref(false);
const libraryInput = ref<HTMLInputElement | null>(null);
const libraryImportResult = ref<{
  tags: { imported: number; skipped: number };
  formats: { imported: number; skipped: number };
  emulsions: { imported: number; skipped: number };
  errors: { entity: string; index: number; reason: string }[];
} | null>(null);

const importingFilmsJson = ref(false);
const filmsJsonInput = ref<HTMLInputElement | null>(null);
const filmsJsonImportResult = ref<{
  imported: number;
  skipped: number;
  errors: { index: number; name: string; reason: string }[];
} | null>(null);

const exportFilmsJson = async () => {
  exportingJson.value = true;
  try {
    await triggerDownload(exportApi.filmsJsonPath, "films.json");
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    exportingJson.value = false;
  }
};

const exportLibraryJson = async () => {
  exportingLibrary.value = true;
  try {
    await triggerDownload(exportApi.libraryJsonPath, "library.json");
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    exportingLibrary.value = false;
  }
};

const onCsvSelected = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  importingCsv.value = true;
  importResult.value = null;
  try {
    const res = await importApi.importFilms(file);
    importResult.value = res.data;
  } catch (err) {
    console.error("Import failed:", err);
  } finally {
    importingCsv.value = false;
    if (csvInput.value) csvInput.value.value = "";
  }
};

const onLibrarySelected = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  importingLibrary.value = true;
  libraryImportResult.value = null;
  try {
    const res = await importApi.importLibrary(file);
    libraryImportResult.value = res.data;
  } catch (err) {
    console.error("Library import failed:", err);
  } finally {
    importingLibrary.value = false;
    if (libraryInput.value) libraryInput.value.value = "";
  }
};

const onFilmsJsonSelected = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  importingFilmsJson.value = true;
  filmsJsonImportResult.value = null;
  try {
    const res = await importApi.importFilmsJson(file);
    filmsJsonImportResult.value = res.data;
  } catch (err) {
    console.error("Films JSON import failed:", err);
  } finally {
    importingFilmsJson.value = false;
    if (filmsJsonInput.value) filmsJsonInput.value.value = "";
  }
};
</script>
