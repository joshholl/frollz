<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NEmpty, NText, NTimeline, NTimelineItem } from 'naive-ui';
import type { DeviceLoadTimelineEvent } from '@frollz2/schema';
import { useResponsiveTimelinePlacement } from '../../composables/useResponsiveTimelinePlacement.js';
import { mapDeviceLoadEventsToTimeline } from '../../pages/device-detail-timeline.js';

const props = defineProps<{
  events: DeviceLoadTimelineEvent[];
  loading: boolean;
}>();

const timelineItems = computed(() => mapDeviceLoadEventsToTimeline(props.events));
const { timelinePlacement } = useResponsiveTimelinePlacement();
</script>

<template>
  <NCard>
    <NTimeline
      v-if="timelineItems.length > 0"
      :item-placement="timelinePlacement"
      class="device-load-timeline-card__timeline"
    >
      <NTimelineItem
        v-for="item in timelineItems"
        :key="item.eventId"
        class="device-load-timeline-card__item"
      >
        <template #icon>
          <span
            class="device-load-timeline-card__dot"
            :style="{ backgroundColor: item.dotColor }"
          />
        </template>

        <div class="device-load-timeline-card__content">
          <NText
            class="device-load-timeline-card__title"
            :style="{ color: item.titleColor }"
          >
            {{ item.filmName }}
          </NText>
          <NText class="device-load-timeline-card__emulsion">
            {{ item.emulsionName }}
          </NText>
          <NText
            v-if="item.stockLabel"
            depth="3"
            class="device-load-timeline-card__stock"
          >
            {{ item.stockLabel }}
          </NText>
          <NText depth="3" class="device-load-timeline-card__date">
            {{ item.occurredLabel }}
          </NText>
          <NText
            v-if="item.removedLabel"
            depth="3"
            class="device-load-timeline-card__date"
          >
            Removed: {{ item.removedLabel }}
          </NText>
          <NText v-if="item.slotLabel" depth="3">
            {{ item.slotLabel }}
          </NText>
        </div>
      </NTimelineItem>
    </NTimeline>

    <NEmpty
      v-else-if="!loading"
      description="No load events yet for this device."
    />
  </NCard>
</template>

<style scoped>
.device-load-timeline-card__timeline {
  margin-top: 0;
}

.device-load-timeline-card__item {
  padding-bottom: 8px;
}

.device-load-timeline-card__content {
  width: 100%;
}

.device-load-timeline-card__title {
  display: block;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 2px;
}

.device-load-timeline-card__emulsion {
  display: block;
  line-height: 1.2;
  margin-bottom: 2px;
}

.device-load-timeline-card__stock {
  display: block;
  line-height: 1.2;
  margin-bottom: 2px;
}

.device-load-timeline-card__date {
  display: block;
  line-height: 1.2;
}

.device-load-timeline-card__dot {
  border-radius: 999px;
  display: inline-block;
  height: 10px;
  width: 10px;
}
</style>
