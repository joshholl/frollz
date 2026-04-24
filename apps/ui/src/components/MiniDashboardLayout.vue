<script setup lang="ts">
import DashboardSplitLayout from './inventory/DashboardSplitLayout.vue';

defineProps<{
  leftPanelTitle: string;
  rightPanelTitle: string;
}>();
</script>

<template>
  <DashboardSplitLayout :left-panel-title="leftPanelTitle" :right-panel-title="rightPanelTitle">
    <template v-if="$slots['left-header']" #left-header>
      <slot name="left-header" />
    </template>
    <template #left>
      <slot name="left" />
    </template>
    <template v-if="$slots['right-header']" #right-header>
      <slot name="right-header" />
    </template>
    <template #right>
      <slot name="right" />
    </template>
  </DashboardSplitLayout>
</template>
