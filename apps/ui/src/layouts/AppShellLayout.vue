<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const leftDrawerOpen = ref(false);

const primaryLinks = [
  { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
  { label: 'Film', to: '/film', icon: 'camera_roll' },
  { label: 'Devices', to: '/devices', icon: 'photo_camera' },
  { label: 'Emulsions', to: '/emulsions', icon: 'water_drop' },
  { label: 'Style Guide', to: '/style-guide', icon: 'palette' }
] as const;

const groupedLinks = [
  {
    label: 'Film Views',
    children: [
      { label: '35mm', to: '/film/35mm' },
      { label: 'Medium Format', to: '/film/medium-format' },
      { label: 'Large Format 4x5', to: '/film/large-format-4x5' },
      { label: 'Large Format 8x10', to: '/film/large-format-8x10' }
    ]
  },
  {
    label: 'Device Views',
    children: [
      { label: 'Cameras', to: '/devices/cameras' },
      { label: 'Film Holders', to: '/devices/film-holders' },
      { label: 'Interchangeable Backs', to: '/devices/interchangeable-backs' }
    ]
  },
  {
    label: 'Emulsion Views',
    children: [
      { label: 'Black & White', to: '/emulsions/black-and-white' },
      { label: 'B&W Reversal', to: '/emulsions/black-and-white-reversal' },
      { label: 'Cine (ECN-2)', to: '/emulsions/cine-ecn2' },
      { label: 'Color Negative (C-41)', to: '/emulsions/color-negative-c41' },
      { label: 'Color Positive (E-6)', to: '/emulsions/color-positive-e6' }
    ]
  }
] as const;

const pageTitle = computed(() => String(route.meta.title ?? 'frollz'));

async function logout(): Promise<void> {
  await authStore.logout();
  await router.replace('/login');
}

function closeDrawerOnNavigate(): void {
  leftDrawerOpen.value = false;
}
</script>

<template>
  <q-layout view="hHh Lpr lFf" class="app-shell-layout">
    <q-header elevated class="app-shell-header">
      <q-toolbar>
        <q-btn flat round dense icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>{{ pageTitle }}</q-toolbar-title>
        <div class="row items-center q-gutter-sm">
          <q-chip v-if="authStore.user" dense>{{ authStore.user.email }}</q-chip>
          <q-btn flat color="negative" label="Logout" @click="logout" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="280" class="app-shell-drawer">
      <q-list padding>
        <q-item class="q-px-none">
          <q-item-section>
            <q-item-label header class="q-pa-none">Navigation</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat dense round icon="close" aria-label="Close" @click="leftDrawerOpen = false" />
          </q-item-section>
        </q-item>

        <q-item v-for="link in primaryLinks" :key="link.to" clickable :to="link.to" exact @click="closeDrawerOnNavigate">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>

        <q-separator spaced />

        <q-expansion-item
          v-for="group in groupedLinks"
          :key="group.label"
          dense
          dense-toggle
          expand-separator
          :label="group.label"
        >
          <q-list>
            <q-item v-for="child in group.children" :key="child.to" clickable :to="child.to" @click="closeDrawerOnNavigate">
              <q-item-section>{{ child.label }}</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <main id="app-main-content">
        <RouterView />
      </main>
    </q-page-container>
  </q-layout>
</template>
