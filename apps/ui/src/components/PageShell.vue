<script setup lang="ts">
import { NFlex, NSpace, NThing } from 'naive-ui';

defineProps<{
  title: string;
  subtitle?: string;
  compact?: boolean;
}>();
</script>

<template>
  <section class="page-shell" :class="{ 'page-shell--compact': compact }">
    <NFlex class="page-shell__header" justify="space-between" align="flex-start" :wrap="false">
      <NThing v-if="subtitle" class="page-shell__heading" :title="title" :description="subtitle" />
      <NThing v-else class="page-shell__heading" :title="title" />
      <NFlex v-if="$slots.actions" class="page-shell__actions" justify="end">
        <slot name="actions" />
      </NFlex>
    </NFlex>
    <NSpace vertical :size="16">
      <slot />
    </NSpace>
  </section>
</template>

<style scoped>
.page-shell {
  margin: 0 auto;
  max-width: 1240px;
  padding: 24px 20px 40px;
  width: 100%;
}

.page-shell--compact {
  max-width: 560px;
}

.page-shell__header {
  gap: 12px;
  margin-bottom: 18px;
}

.page-shell__heading {
  max-width: 74ch;
  min-width: 0;
}

.page-shell__actions {
  flex-wrap: wrap;
  gap: 8px;
  min-width: fit-content;
}

@media (max-width: 900px) {
  .page-shell {
    padding: 16px 12px 28px;
  }

  .page-shell__header {
    margin-bottom: 12px;
    flex-wrap: wrap;
  }

  .page-shell__actions {
    width: 100%;
  }
}
</style>
