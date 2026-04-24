import { computed, onBeforeUnmount, onMounted, ref, type ComputedRef } from 'vue';

type TimelinePlacement = 'left' | 'right';

type UseResponsiveTimelinePlacementResult = {
  timelinePlacement: ComputedRef<TimelinePlacement>;
};

export function useResponsiveTimelinePlacement(query = '(max-width: 768px)'): UseResponsiveTimelinePlacementResult {
  const isCompactTimeline = ref(false);
  let timelineMediaQuery: MediaQueryList | null = null;

  function syncTimelinePlacement(eventOrQuery: MediaQueryList | MediaQueryListEvent): void {
    isCompactTimeline.value = eventOrQuery.matches;
  }

  onMounted((): void => {
    timelineMediaQuery = window.matchMedia(query);
    syncTimelinePlacement(timelineMediaQuery);
    timelineMediaQuery.addEventListener('change', syncTimelinePlacement);
  });

  onBeforeUnmount((): void => {
    timelineMediaQuery?.removeEventListener('change', syncTimelinePlacement);
    timelineMediaQuery = null;
  });

  return {
    timelinePlacement: computed<TimelinePlacement>(() => (isCompactTimeline.value ? 'left' : 'right'))
  };
}
