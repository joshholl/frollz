<script setup lang="ts">
import { NGrid, NGridItem, NSpace, NThing } from 'naive-ui';

defineProps<{
  leftPanelTitle: string;
  rightPanelTitle: string;
}>();
</script>

<template>
  <NGrid
    cols="1 m:1 l:12"
    responsive="screen"
    item-responsive
    :x-gap="16"
    :y-gap="16"
  >
    <NGridItem span="1 l:7 xl:8">
      <NSpace vertical :size="10" class="dashboard-split-layout__column">
        <slot name="left-header">
          <NThing :title="leftPanelTitle" />
        </slot>
        <div class="dashboard-split-layout__panel dashboard-split-layout__panel--left">
          <slot name="left" />
        </div>
      </NSpace>
    </NGridItem>

    <NGridItem span="1 l:5 xl:4">
      <NSpace vertical :size="10" class="dashboard-split-layout__column">
        <slot name="right-header">
          <NThing :title="rightPanelTitle" />
        </slot>
        <div class="dashboard-split-layout__panel dashboard-split-layout__panel--right">
          <slot name="right" />
        </div>
      </NSpace>
    </NGridItem>
  </NGrid>
</template>

<style scoped>
.dashboard-split-layout__column {
  height: 100%;
}

.dashboard-split-layout__panel {
  min-width: 0;
}

.dashboard-split-layout__panel--left,
.dashboard-split-layout__panel--right {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
