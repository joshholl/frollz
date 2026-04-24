<script setup lang="ts">
import { NDrawer, NDrawerContent, NButton, NLayoutSider, NMenu, NSpace, NThing, type MenuOption } from 'naive-ui';

defineProps<{
  collapsed: boolean;
  expandedKeys: string[];
  isAuthenticated: boolean;
  isMobile: boolean;
  mobileMenuOpen: boolean;
  selectedKey: string | null;
  menuOptions: MenuOption[];
}>();

const emit = defineEmits<{
  'toggle:mobileMenu': [value: boolean];
  'update:collapsed': [value: boolean];
  'update:expandedKeys': [value: string[]];
  select: [key: string];
  logout: [];
}>();
</script>

<template>
  <NLayoutSider
    v-if="isAuthenticated && !isMobile"
    bordered
    collapse-mode="width"
    :collapsed="collapsed"
    :collapsed-width="64"
    :width="280"
    show-trigger="bar"
    :native-scrollbar="false"
    class="app-shell__sider"
    @update:collapsed="(value) => emit('update:collapsed', value)"
  >
    <div class="app-shell__brand">
      <NThing :title="collapsed ? 'F2' : 'Frollz2'" :description="collapsed ? '' : 'Admin shell'" />
    </div>
    <NMenu
      :value="selectedKey"
      :collapsed="collapsed"
      :collapsed-width="64"
      :indent="14"
      :options="menuOptions"
      :expanded-keys="expandedKeys"
      @update:value="(value) => emit('select', value)"
      @update:expanded-keys="(value) => emit('update:expandedKeys', value)"
    />
  </NLayoutSider>

  <NDrawer
    :show="mobileMenuOpen"
    placement="left"
    width="min(100vw, 360px)"
    @update:show="(value) => emit('toggle:mobileMenu', value)"
  >
    <NDrawerContent title="Navigation" closable>
      <NSpace vertical size="large">
        <NMenu
          :value="selectedKey"
          :indent="14"
          :options="menuOptions"
          :expanded-keys="expandedKeys"
          @update:value="(value) => emit('select', value)"
          @update:expanded-keys="(value) => emit('update:expandedKeys', value)"
        />
        <NButton type="error" secondary @click="emit('logout')">Logout</NButton>
      </NSpace>
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped>
.app-shell__sider {
  border-right: 1px solid var(--n-border-color);
}

.app-shell__brand {
  padding: 16px 12px 10px;
}
</style>
