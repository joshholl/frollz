<script setup lang="ts">
import { NGrid, NGridItem, NScrollbar, NSpace, NThing } from 'naive-ui';

defineProps<{
  leftPanelTitle: string;
  rightPanelTitle: string;
}>();
</script>

<template>
  <NGrid cols="1 s:1 l:12" responsive="screen" :x-gap="16" :y-gap="16">
    <NGridItem span="1 l:8">
      <NSpace vertical :size="10">
        <slot name="left-header">
          <NThing :title="leftPanelTitle" />
        </slot>
        <NScrollbar x-scrollable style="max-height: 540px; min-height: 420px;">
          <slot name="left" />
        </NScrollbar>
      </NSpace>
    </NGridItem>

    <NGridItem span="1 l:4">
      <NSpace vertical :size="10">
        <slot name="right-header">
          <NThing :title="rightPanelTitle" />
        </slot>
        <NSpace vertical :size="12">
          <slot name="right" />
        </NSpace>
      </NSpace>
    </NGridItem>
  </NGrid>
</template>
