<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router';
import { NLayout, NLayoutContent } from 'naive-ui';
import { useAuthStore } from '../stores/auth.js';
import AppHeaderBar from '../components/shell/AppHeaderBar.vue';
import AppSidebarMenu from '../components/shell/AppSidebarMenu.vue';
import { useAppShellNavigation } from '../composables/useAppShellNavigation.js';

const authStore = useAuthStore();
const router = useRouter();
const {
  breadcrumbItems,
  expandedKeys,
  handleExpandedKeys,
  handleMenuSelect,
  isMobile,
  isMobileMenuOpen,
  isSidebarCollapsed,
  menuOptions,
  selectedKey,
  toggleDesktopSidebar
} = useAppShellNavigation();

async function handleLogout(): Promise<void> {
  await authStore.logout();
  isMobileMenuOpen.value = false;
  await router.replace('/login');
}
</script>

<template>
  <NLayout has-sider class="app-shell">
    <AppSidebarMenu
      :collapsed="isSidebarCollapsed"
      :expanded-keys="expandedKeys"
      :is-authenticated="authStore.isAuthenticated"
      :is-mobile="isMobile"
      :mobile-menu-open="isMobileMenuOpen"
      :selected-key="selectedKey"
      :menu-options="menuOptions"
      @logout="handleLogout"
      @select="handleMenuSelect"
      @toggle:mobile-menu="(value) => { isMobileMenuOpen = value; }"
      @update:collapsed="(value) => { isSidebarCollapsed = value; }"
      @update:expanded-keys="handleExpandedKeys"
    />

    <NLayout>
      <AppHeaderBar
        :breadcrumb-items="breadcrumbItems"
        :is-mobile="isMobile"
        :is-sidebar-collapsed="isSidebarCollapsed"
        :user-email="authStore.user?.email ?? null"
        @logout="handleLogout"
        @open:mobile-menu="isMobileMenuOpen = true"
        @toggle:sidebar="toggleDesktopSidebar"
      />

      <NLayoutContent class="app-shell__content">
        <main id="app-main-content" class="app-shell__main">
          <RouterView />
        </main>
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-shell__menu-label {
  align-items: center;
  display: flex;
  gap: 10px;
  width: 100%;
}

.app-shell__menu-text {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-shell__menu-badge {
  flex: 0 0 auto;
}

.app-shell__content {
  min-height: calc(100vh - 64px);
}

.app-shell__main {
  min-height: calc(100vh - 64px);
}
</style>
