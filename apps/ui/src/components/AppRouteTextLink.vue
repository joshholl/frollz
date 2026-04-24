<script setup lang="ts">
import { RouterLink } from 'vue-router';

defineProps<{
  label: string;
  to: string;
  testId?: string;
}>();
</script>

<template>
  <RouterLink :to="to" class="app-route-text-link" :data-testid="testId">
    {{ label }}
  </RouterLink>
</template>

<style scoped>
.app-route-text-link {
  color: var(--n-primary-color);
  font-weight: 600;
  text-decoration: none;
  text-decoration-color: var(--n-primary-color);
}

.app-route-text-link:hover {
  text-decoration: underline;
}

.app-route-text-link:visited {
  color: var(--n-primary-color);
}

.app-route-text-link:focus-visible {
  border-radius: 4px;
  outline: 2px solid var(--n-primary-color);
  outline-offset: 2px;
}
</style>
