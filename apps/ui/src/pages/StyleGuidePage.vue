<script setup lang="ts">
const brandSwatches = [
  { label: 'Primary', value: '#403d39' },
  { label: 'Secondary', value: '#ccc5b9' },
  { label: 'Accent', value: '#eb5e28' },
  { label: 'Dark', value: '#8c867d' },
  { label: 'Dark Page', value: '#252422' },
  { label: 'Positive', value: '#4a7c59' },
  { label: 'Negative', value: '#f25c54' },
  { label: 'Info', value: '#b0a1ba' },
  { label: 'Warning', value: '#f7b267' }
] as const;

const uiSwatches = [
  { label: '--app-bg', value: '#f3efe8' },
  { label: '--app-surface', value: '#f8f4ee' },
  { label: '--app-surface-raised', value: '#fffdf9' },
  { label: '--app-border', value: '#d8cfc0' },
  { label: '--app-text', value: '#2f2b27' },
  { label: '--app-muted', value: '#7a736a' },
  { label: '--app-primary-soft', value: '#e7dfd2' },
  { label: '--app-accent-soft', value: '#f6d2c3' }
] as const;

const tableRows = [
  { token: 'Primary button', use: 'Main call-to-action', sample: 'High emphasis action' },
  { token: 'Secondary button', use: 'Supporting action', sample: 'Low emphasis action' },
  { token: 'Accent hover', use: 'Interactive feedback', sample: 'Links, nav hover, focus moments' }
];
</script>

<template>
  <q-page class="q-pa-md column q-gutter-md">
    <div>
      <div class="text-h5">Style Guide</div>
      <div class="text-subtitle2 text-grey-7">Quick reference for earthy palette and component treatments.</div>
    </div>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Brand Colors</div>
        <div class="row q-col-gutter-sm">
          <div v-for="swatch in brandSwatches" :key="swatch.label" class="col-6 col-sm-4 col-md-3">
            <q-card flat bordered>
              <q-card-section class="q-pa-sm">
                <div class="style-chip" :style="{ backgroundColor: swatch.value }" />
                <div class="text-body2 text-weight-medium q-mt-sm">{{ swatch.label }}</div>
                <div class="text-caption text-grey-7">{{ swatch.value }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">UI Tokens</div>
        <div class="row q-col-gutter-sm">
          <div v-for="swatch in uiSwatches" :key="swatch.label" class="col-6 col-sm-4 col-md-3">
            <q-card flat bordered>
              <q-card-section class="q-pa-sm">
                <div class="style-chip" :style="{ backgroundColor: swatch.value }" />
                <div class="text-body2 text-weight-medium q-mt-sm">{{ swatch.label }}</div>
                <div class="text-caption text-grey-7">{{ swatch.value }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Buttons, Chips, Badges</div>
        <div class="row items-center q-gutter-sm q-mb-md">
          <q-btn color="primary" label="Primary" />
          <q-btn color="secondary" label="Secondary" />
          <q-btn color="accent" label="Accent" />
          <q-btn flat label="Flat" />
        </div>
        <div class="row items-center q-gutter-sm">
          <q-chip>Default chip</q-chip>
          <q-chip color="secondary" text-color="dark">Secondary chip</q-chip>
          <q-badge color="primary">Primary badge</q-badge>
          <q-badge color="negative">Negative badge</q-badge>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Form Controls</div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-input filled label="Input sample" model-value="Earthy field" />
          </div>
          <div class="col-12 col-md-6">
            <q-select filled label="Select sample" model-value="Primary" :options="['Primary', 'Secondary', 'Accent']" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Feedback Banners</div>
        <div class="column q-gutter-sm">
          <q-banner class="bg-green-1 text-positive" rounded>Positive feedback sample</q-banner>
          <q-banner class="bg-red-1 text-negative" rounded>Negative feedback sample</q-banner>
          <q-banner class="bg-orange-1 text-warning" rounded>Warning feedback sample</q-banner>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle1 q-mb-sm">Table & Link States</div>
        <q-table
          :rows="tableRows"
          row-key="token"
          flat
          bordered
          :columns="[
            { name: 'token', label: 'Token', field: 'token', align: 'left' },
            { name: 'use', label: 'Use', field: 'use', align: 'left' },
            { name: 'sample', label: 'Sample', field: 'sample', align: 'left' }
          ]"
          hide-pagination
        >
          <template #body-cell-sample="props">
            <q-td :props="props">
              <a href="#">{{ props.row.sample }}</a>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<style scoped>
.style-chip {
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>
