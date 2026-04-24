<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { NBreadcrumb, NBreadcrumbItem, NButton, NIcon, NLayoutHeader, NSpace, NText } from 'naive-ui';
import type { BreadcrumbItem } from '../../composables/useAppShellNavigation.js';
import { CollapseIcon, ExpandIcon, MenuIcon } from './icons.js';

defineProps<{
  breadcrumbItems: BreadcrumbItem[];
  isMobile: boolean;
  isSidebarCollapsed: boolean;
  userEmail: string | null;
}>();

const emit = defineEmits<{
  logout: [];
  'open:mobileMenu': [];
  'toggle:sidebar': [];
}>();
</script>

<template>
  <NLayoutHeader bordered class="app-shell__header">
    <NSpace justify="space-between" align="center" :wrap="false" style="width: 100%;">
      <NSpace align="center" :wrap="false" class="app-shell__header-left">
        <NButton v-if="isMobile" aria-label="Menu" secondary circle @click="emit('open:mobileMenu')">
          <template #icon>
            <NIcon>
              <MenuIcon />
            </NIcon>
          </template>
        </NButton>
        <NButton v-else aria-label="Toggle sidebar" secondary circle @click="emit('toggle:sidebar')">
          <template #icon>
            <NIcon>
              <CollapseIcon v-if="!isSidebarCollapsed" />
              <ExpandIcon v-else />
            </NIcon>
          </template>
        </NButton>
        <nav class="app-shell__breadcrumb-wrap" aria-label="Breadcrumb">
          <NBreadcrumb separator=">" class="app-shell__breadcrumb">
            <NBreadcrumbItem v-for="crumb in breadcrumbItems" :key="crumb.key">
              <RouterLink
                v-if="crumb.to && !crumb.isCurrent"
                :to="crumb.to"
                class="app-shell__breadcrumb-link"
                :aria-label="crumb.ariaLabel ?? crumb.label"
              >
                <NIcon v-if="crumb.icon" size="16" aria-hidden="true">
                  <component :is="crumb.icon" />
                </NIcon>
                <span>{{ crumb.label }}</span>
              </RouterLink>
              <span v-else class="app-shell__breadcrumb-current" :aria-current="crumb.isCurrent ? 'page' : undefined">
                <NIcon v-if="crumb.icon" size="16" aria-hidden="true">
                  <component :is="crumb.icon" />
                </NIcon>
                <span>{{ crumb.label }}</span>
              </span>
            </NBreadcrumbItem>
          </NBreadcrumb>
        </nav>
      </NSpace>
      <NSpace align="center" :wrap="false" class="app-shell__header-right">
        <NText v-if="userEmail" depth="3" class="app-shell__user">{{ userEmail }}</NText>
        <NButton tertiary type="error" @click="emit('logout')">Logout</NButton>
      </NSpace>
    </NSpace>
  </NLayoutHeader>
</template>

<style scoped>
.app-shell__header {
  align-items: center;
  display: flex;
  min-height: 64px;
  padding: 8px 12px;
}

.app-shell__header-left {
  flex: 1 1 auto;
  min-width: 0;
}

.app-shell__header-right {
  flex: 0 0 auto;
}

.app-shell__breadcrumb-wrap {
  min-width: 0;
  overflow: hidden;
}

.app-shell__breadcrumb {
  min-width: 0;
}

.app-shell__breadcrumb-link,
.app-shell__breadcrumb-current {
  align-items: center;
  display: inline-flex;
  gap: 6px;
  max-width: 32vw;
}

.app-shell__breadcrumb-link {
  color: inherit;
  text-decoration: none;
}

.app-shell__breadcrumb-link:hover {
  text-decoration: underline;
}

.app-shell__breadcrumb-link span,
.app-shell__breadcrumb-current span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-shell__user {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .app-shell__user {
    display: none;
  }
}

@media (min-width: 901px) {
  .app-shell__header {
    padding: 0 16px;
  }

  .app-shell__breadcrumb-link,
  .app-shell__breadcrumb-current {
    max-width: 220px;
  }
}
</style>
