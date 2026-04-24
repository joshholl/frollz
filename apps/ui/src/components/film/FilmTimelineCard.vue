<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { NCard, NEmpty, NText, NTimeline, NTimelineItem } from 'naive-ui';
import type { FilmDevice, FilmJourneyEvent } from '@frollz2/schema';

type StorageLocation = {
  id: number;
  label: string;
};

const props = defineProps<{
  events: FilmJourneyEvent[];
  devices: FilmDevice[];
  loading: boolean;
  storageLocations: StorageLocation[];
}>();

const stateTypeByCode: Record<string, 'default' | 'info' | 'primary' | 'warning' | 'success'> = {
  purchased: 'default',
  stored: 'info',
  loaded: 'primary',
  exposed: 'warning',
  removed: 'warning',
  sent_for_dev: 'info',
  developed: 'success',
  scanned: 'success',
  archived: 'default'
};

const tagColorByType: Record<
  'default' | 'info' | 'primary' | 'warning' | 'success',
  { dotColor: string }
> = {
  default: { dotColor: '#8c8c8c' },
  info: { dotColor: '#2080f0' },
  primary: { dotColor: '#4d6bfe' },
  warning: { dotColor: '#f0a020' },
  success: { dotColor: '#18a058' }
};

const isCompactTimeline = ref(false);
const timelinePlacement = computed<'left' | 'right'>(() => (isCompactTimeline.value ? 'left' : 'right'));
const timelineEvents = computed(() =>
  [...props.events]
    .sort((left, right) => {
      const leftOccurredAt = parseOccurredAt(left.occurredAt);
      const rightOccurredAt = parseOccurredAt(right.occurredAt);
      if (leftOccurredAt !== rightOccurredAt) {
        return rightOccurredAt - leftOccurredAt;
      }

      return right.id - left.id;
    })
    .map((event) => ({
      id: event.id,
      stateLabel: humanizeCode(event.filmStateCode),
      occurredLabel: formatDateTime(event.occurredAt),
      detailFields: eventDataEntries(event),
      notes: normalizeOptionalText(event.notes),
      dotColor: tagColorByType[stateTypeByCode[event.filmStateCode] ?? 'default'].dotColor
    }))
);

let timelineMediaQuery: MediaQueryList | null = null;

function parseOccurredAt(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.MIN_SAFE_INTEGER : parsed;
}

function humanizeCode(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function humanizeDevice(device: FilmDevice): string {
  if (device.deviceTypeCode === 'camera') {
    return `${device.make} ${device.model}`.trim();
  }
  if (device.deviceTypeCode === 'interchangeable_back') {
    return `${device.name} ${device.system}`.trim();
  }

  return `${device.name} ${device.brand}`.trim();
}

function normalizeOptionalText(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function syncTimelinePlacement(eventOrQuery: MediaQueryList | MediaQueryListEvent): void {
  isCompactTimeline.value = eventOrQuery.matches;
}

function formatDateTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(parsed);
}

function eventDataEntries(event: FilmJourneyEvent): Array<{ label: string; value: string }> {
  const loadTargetType = typeof event.eventData['loadTargetType'] === 'string' ? event.eventData['loadTargetType'] : null;
  if (loadTargetType) {
    const deviceId = (
      typeof event.eventData['cameraId'] === 'number'
        ? event.eventData['cameraId']
        : typeof event.eventData['interchangeableBackId'] === 'number'
          ? event.eventData['interchangeableBackId']
          : typeof event.eventData['filmHolderId'] === 'number'
            ? event.eventData['filmHolderId']
            : null
    );
    const slotNumber = typeof event.eventData['slotNumber'] === 'number' ? event.eventData['slotNumber'] : null;
    const device = deviceId ? props.devices.find((entry) => entry.id === deviceId) ?? null : null;

    const entries: Array<{ label: string; value: string }> = [];
    if (deviceId) {
      entries.push({
        label: 'Loaded Target',
        value: device ? humanizeDevice(device) : String(deviceId)
      });
    }
    if (slotNumber) {
      entries.push({ label: 'Holder Slot', value: String(slotNumber) });
    }

    const passthrough = Object.entries(event.eventData)
      .filter(([key]) => !['loadTargetType', 'cameraId', 'interchangeableBackId', 'filmHolderId', 'slotNumber'].includes(key))
      .map(([key, value]) => toReadableEventField(key, value))
      .filter((entry): entry is { label: string; value: string } => entry !== null);

    return [...entries, ...passthrough];
  }

  return Object.entries(event.eventData)
    .map(([key, value]) => toReadableEventField(key, value))
    .filter((entry): entry is { label: string; value: string } => entry !== null);
}

function toReadableEventField(key: string, value: unknown): { label: string; value: string } | null {
  if (value === null || value === '') {
    return null;
  }

  if (isDeviceReferenceKey(key) && typeof value === 'number') {
    const device = props.devices.find((entry) => entry.id === value);
    return {
      label: 'Device',
      value: device ? humanizeDevice(device) : String(value)
    };
  }

  if (key === 'storageLocationId' && typeof value === 'number') {
    const location = props.storageLocations.find((entry) => entry.id === value);
    return {
      label: 'Storage Location',
      value: location?.label ?? String(value)
    };
  }

  return {
    label: humanizeCode(key),
    value: String(value)
  };
}

function isDeviceReferenceKey(key: string): boolean {
  return /(?:device|receiver)Id$/i.test(key);
}

onMounted(() => {
  timelineMediaQuery = window.matchMedia('(max-width: 768px)');
  syncTimelinePlacement(timelineMediaQuery);
  timelineMediaQuery.addEventListener('change', syncTimelinePlacement);
});

onBeforeUnmount(() => {
  timelineMediaQuery?.removeEventListener('change', syncTimelinePlacement);
  timelineMediaQuery = null;
});
</script>

<template>
  <NCard>
    <NTimeline v-if="timelineEvents.length > 0" :item-placement="timelinePlacement">
      <NTimelineItem v-for="event in timelineEvents" :key="event.id" :title="event.stateLabel">
        <template #icon>
          <span class="film-timeline__dot" :style="{ backgroundColor: event.dotColor }" />
        </template>
        <div class="film-timeline__item-content">
          <NText depth="3" class="film-timeline__item-date">{{ event.occurredLabel }}</NText>
          <NText v-if="event.notes" class="film-timeline__item-notes">Notes: {{ event.notes }}</NText>
          <NText v-for="field in event.detailFields" :key="`${event.id}-${field.label}`" depth="3">
            {{ field.label }}: {{ field.value }}
          </NText>
        </div>
      </NTimelineItem>
    </NTimeline>
    <NEmpty v-else-if="!loading" description="No events yet for this film." />
  </NCard>
</template>

<style scoped>
.film-timeline__item-content {
  width: 100%;
}

.film-timeline__item-notes {
  display: block;
  margin: 4px 0;
}

.film-timeline__item-date {
  display: block;
  margin-bottom: 4px;
}

.film-timeline__dot {
  border-radius: 999px;
  display: inline-block;
  height: 10px;
  width: 10px;
}
</style>
