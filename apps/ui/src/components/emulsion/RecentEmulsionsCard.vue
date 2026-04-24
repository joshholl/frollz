<script setup lang="ts">
import { NCard, NEmpty, NFlex, NTag, NText } from 'naive-ui';
import type { Emulsion } from '@frollz2/schema';

defineProps<{
  emulsions: Emulsion[];
  loading?: boolean;
}>();
</script>

<template>
  <NCard :loading="loading">
    <NEmpty
      v-if="!loading && emulsions.length === 0"
      description="No emulsions are available."
    />
    <NFlex v-else vertical size="small">
      <NCard v-for="emulsion in emulsions" :key="emulsion.id" size="small" embedded>
        <NFlex justify="space-between" align="center" :wrap="false">
          <NText strong>{{ emulsion.manufacturer }} {{ emulsion.brand }}</NText>
          <NTag size="small" type="primary">ISO {{ emulsion.isoSpeed }}</NTag>
        </NFlex>
        <NText depth="3">{{ emulsion.developmentProcess.label }} · {{ emulsion.balance }}</NText>
        <NText depth="3">
          Formats: {{ emulsion.filmFormats.map((format) => format.code).join(', ') || 'None' }}
        </NText>
      </NCard>
    </NFlex>
  </NCard>
</template>
