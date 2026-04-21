<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute, useRouter, RouterView } from 'vue-router';
import {
  NConfigProvider,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NLayoutSider,
  NMenu,
  NButton,
  NSpace,
  NText,
  NMessageProvider
} from 'naive-ui';
import { useAuthStore } from './stores/auth.js';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const menuOptions = [
  { label: 'Film', key: '/film' },
  { label: 'Receivers', key: '/receivers' },
  { label: 'Emulsions', key: '/emulsions' }
];

const selectedKey = computed(() => route.path);

onMounted(async () => {
  await authStore.restoreSession();
});

async function handleLogout(): Promise<void> {
  await authStore.logout();
  await router.push('/login');
}

function handleMenuSelect(key: string): void {
  void router.push(key);
}
</script>

<template>
  <NConfigProvider>
    <NMessageProvider>
        <NLayout has-sider>
        <NLayoutSider v-if="authStore.isAuthenticated" bordered collapse-mode="width" :collapsed-width="64" :width="220">
          <NSpace vertical size="large" align="stretch">
            <NText strong>Frollz2</NText>
            <NMenu :value="selectedKey" :options="menuOptions" @update:value="handleMenuSelect" />
            <NButton type="error" secondary @click="handleLogout">Logout</NButton>
          </NSpace>
        </NLayoutSider>
        <NLayout>
          <NLayoutHeader bordered>
            <NSpace justify="space-between" align="center">
              <NText strong>Analog Film Tracker</NText>
              <NText v-if="authStore.user">{{ authStore.user.email }}</NText>
            </NSpace>
          </NLayoutHeader>
          <NLayoutContent>
            <RouterView />
          </NLayoutContent>
        </NLayout>
      </NLayout>
    </NMessageProvider>
  </NConfigProvider>
</template>
