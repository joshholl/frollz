<script setup lang="ts">
import { useRouter } from 'vue-router';
import { NButton, NCard, NEmpty, NFlex, NTag, NText } from 'naive-ui';
import type { FilmSummary } from '@frollz2/schema';

defineProps<{
  films: FilmSummary[];
  loading?: boolean;
  stateTypeByCode: Record<string, 'default' | 'info' | 'primary' | 'warning' | 'success'>;
}>();

const router = useRouter();
</script>

<template>
  <NCard :loading="loading">
    <NEmpty
      v-if="!loading && films.length === 0"
      description="No films are available yet."
    />
    <NFlex v-else vertical size="small">
      <NCard v-for="film in films" :key="film.id" size="small" embedded>
        <NFlex justify="space-between" align="center" :wrap="false">
          <NText strong>{{ film.name }}</NText>
          <NTag :type="stateTypeByCode[film.currentStateCode] ?? 'default'" size="small">
            {{ film.currentState.label }}
          </NTag>
        </NFlex>
        <NText depth="3">{{ film.emulsion.manufacturer }} {{ film.emulsion.brand }} · ISO {{ film.emulsion.isoSpeed }}</NText>
        <NText depth="3">{{ film.filmFormat.code }} · {{ film.packageType.label }}</NText>
        <NFlex justify="end">
          <NButton tertiary size="small" @click="router.push(`/film/${film.id}`)">Open timeline</NButton>
        </NFlex>
      </NCard>
    </NFlex>
  </NCard>
</template>
