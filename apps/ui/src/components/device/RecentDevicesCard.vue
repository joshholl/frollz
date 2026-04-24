<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NEmpty, NFlex, NTag, NText } from 'naive-ui';
import type { FilmDevice, FilmFormat } from '@frollz2/schema';

const props = defineProps<{
  devices: FilmDevice[];
  filmFormats: FilmFormat[];
  loading?: boolean;
  tagTypeByCode: Record<string, 'default' | 'info' | 'primary'>;
}>();

function deviceDetail(device: FilmDevice): string {
  if (device.deviceTypeCode === 'camera') {
    return `${device.make} ${device.model}`;
  }

  if (device.deviceTypeCode === 'interchangeable_back') {
    return `${device.name} · ${device.system}`;
  }

  return `${device.name} · ${device.brand} · ${device.holderTypeCode}`;
}

function filmFormatLabel(device: FilmDevice): string {
  return props.filmFormats.find((format: FilmFormat) => format.id === device.filmFormatId)?.code ?? String(device.filmFormatId);
}
</script>

<template>
  <NCard :loading="loading">
    <NEmpty
      v-if="!loading && devices.length === 0"
      description="No devices found."
    />
    <NFlex v-else vertical size="small">
      <NCard v-for="device in devices" :key="device.id" size="small" embedded>
        <NFlex justify="space-between" align="center" :wrap="false">
          <NTag size="small" :type="tagTypeByCode[device.deviceTypeCode] ?? 'default'">
            {{ device.deviceTypeCode.replace('_', ' ') }}
          </NTag>
          <NText depth="3">
            {{ filmFormatLabel(device) }} · {{ device.frameSize }}
          </NText>
        </NFlex>
        <NText strong>{{ deviceDetail(device) }}</NText>
      </NCard>
    </NFlex>
  </NCard>
</template>
