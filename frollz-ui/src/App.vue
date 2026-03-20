<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <NavBar />
    <main id="main-content" tabindex="-1" class="max-w-screen-xl mx-auto page-x py-8 focus:outline-none">
      <RouterView />
    </main>
    <AppAnnouncer />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
import AppAnnouncer from '@/components/AppAnnouncer.vue'
import { useThemeStore } from '@/stores/theme'

useThemeStore()
</script>
