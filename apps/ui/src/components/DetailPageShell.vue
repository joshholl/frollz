<script setup lang="ts">
import { useRouter } from 'vue-router';
import { NAlert, NButton } from 'naive-ui';
import PageShell from './PageShell.vue';

const props = defineProps<{
  title: string;
  subtitle: string;
  fallbackPath: string;
  errorMessage?: string | null;
}>();

const router = useRouter();

function goBack(): void {
  if (window.history.length > 1) {
    router.back();
    return;
  }

  router.push(props.fallbackPath);
}
</script>

<template>
  <PageShell :title="title" :subtitle="subtitle">
    <template #actions>
      <NButton tertiary @click="goBack">Back</NButton>
      <slot name="actions" />
    </template>

    <NAlert
      v-if="errorMessage"
      type="error"
      :show-icon="true"
      class="detail-page-shell__alert"
    >
      {{ errorMessage }}
    </NAlert>

    <slot />
  </PageShell>
</template>

<style scoped>
.detail-page-shell__alert {
  margin-bottom: 12px;
}
</style>
