<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import {
  NAlert,
  NButton,
  NDatePicker,
  NDrawer,
  NDrawerContent,
  NFlex,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  NSelect,
  NText
} from 'naive-ui';
import type { CreateFilmJourneyEventRequest, CreateFrameJourneyEventRequest, FilmDevice } from '@frollz2/schema';
import { filmTransitionMap } from '@frollz2/schema';
import { createIdempotencyKey } from '../../composables/idempotency.js';
import { useUiFeedback } from '../../composables/useUiFeedback.js';
import { useDeviceStore } from '../../stores/devices.js';
import { useFilmStore } from '../../stores/film.js';
import { useReferenceStore } from '../../stores/reference.js';
import type { FormState } from '../../composables/ui-state.js';

type FilmStateCode = CreateFilmJourneyEventRequest['filmStateCode'];

const props = defineProps<{
  show: boolean;
  filmId: number | null;
  currentStateCode: string | null;
  filmFormatId: number | null;
  isLargeFormatFilm: boolean;
}>();

const emit = defineEmits<{
  'update:show': [value: boolean];
  saved: [];
}>();

const filmStore = useFilmStore();
const referenceStore = useReferenceStore();
const deviceStore = useDeviceStore();
const feedback = useUiFeedback();

const isSavingEvent = ref(false);
const pendingEventKey = ref<string>(createIdempotencyKey());
const occurredAtTimestamp = ref<number | null>(Date.now());
const eventState = ref<FormState>({
  loading: false,
  fieldErrors: {},
  formError: null
});

const eventForm = reactive<{
  filmStateCode: FilmStateCode | null;
  notes: string;
  storageLocationId: number | null;
  filmFrameId: number | null;
  deviceId: number | null;
  slotSideNumber: number | null;
  intendedPushPull: number | null;
  labName: string;
  labContact: string;
  actualPushPull: number | null;
  scannerOrSoftware: string;
  scanLink: string;
}>({
  filmStateCode: null,
  notes: '',
  storageLocationId: null,
  filmFrameId: null,
  deviceId: null,
  slotSideNumber: null,
  intendedPushPull: null,
  labName: '',
  labContact: '',
  actualPushPull: null,
  scannerOrSoftware: '',
  scanLink: ''
});

const isOpen = computed<boolean>({
  get: (): boolean => props.show,
  set: (value: boolean): void => {
    emit('update:show', value);
  }
});

const transitions = computed<Array<{ label: string; value: FilmStateCode }>>(() => {
  if (props.isLargeFormatFilm) {
    const selectedFrame = filmStore.currentFrames.find((frame) => frame.id === eventForm.filmFrameId) ?? null;
    const current = selectedFrame?.currentStateCode ?? 'purchased';
    const allowed = filmTransitionMap.get(current) ?? [];

    return referenceStore.filmStates
      .filter((state) => allowed.includes(state.code))
      .map((state) => ({ label: state.label, value: state.code as FilmStateCode }));
  }

  if (!props.currentStateCode) {
    return [];
  }

  const allowed = filmTransitionMap.get(props.currentStateCode) ?? [];
  return referenceStore.filmStates
    .filter((state) => allowed.includes(state.code))
    .map((state) => ({ label: state.label, value: state.code as FilmStateCode }));
});

const storageLocationOptions = computed(() =>
  referenceStore.storageLocations.map((location) => ({ label: location.label, value: location.id }))
);

const deviceOptions = computed(() =>
  deviceStore.devices
    .filter((device) => {
      if (!props.filmFormatId || device.filmFormatId !== props.filmFormatId) {
        return false;
      }

      if (device.deviceTypeCode === 'camera') {
        return device.loadMode === 'direct';
      }

      return true;
    })
    .map((device) => ({
      label: humanizeDevice(device),
      value: device.id
    }))
);

const selectedLoadDevice = computed(() =>
  eventForm.filmStateCode === 'loaded' && eventForm.deviceId
    ? deviceStore.devices.find((device) => device.id === eventForm.deviceId) ?? null
    : null
);

const holderSlotOptions = computed(() => {
  if (!selectedLoadDevice.value || selectedLoadDevice.value.deviceTypeCode !== 'film_holder') {
    return [];
  }

  return Array.from({ length: selectedLoadDevice.value.slotCount }, (_, index) => {
    const slotNumber = index + 1;
    return { label: `Slot ${slotNumber}`, value: slotNumber };
  });
});

const availableFrameOptions = computed(() =>
  filmStore.currentFrames
    .filter((frame) => props.isLargeFormatFilm || frame.firstLoadedAt === null)
    .map((frame) => ({
      label: `Frame #${frame.frameNumber}${props.isLargeFormatFilm ? ` (${humanizeCode(frame.currentStateCode)})` : ''}`,
      value: frame.id
    }))
);

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

function onChangeFilmState(code: string | null): void {
  eventForm.filmStateCode = code as FilmStateCode | null;
  eventForm.storageLocationId = null;
  eventForm.filmFrameId = null;
  eventForm.deviceId = null;
  eventForm.slotSideNumber = null;
  eventForm.intendedPushPull = null;
  eventForm.labName = '';
  eventForm.labContact = '';
  eventForm.actualPushPull = null;
  eventForm.scannerOrSoftware = '';
  eventForm.scanLink = '';
  eventState.value.fieldErrors = {};
  eventState.value.formError = null;
}

function onChangeDevice(value: number | null): void {
  eventForm.deviceId = value;
  if (!value) {
    eventForm.slotSideNumber = null;
    return;
  }

  const selectedDevice = deviceStore.devices.find((entry) => entry.id === value);
  if (selectedDevice?.deviceTypeCode === 'film_holder') {
    if (
      typeof eventForm.slotSideNumber !== 'number'
      || eventForm.slotSideNumber < 1
      || eventForm.slotSideNumber > selectedDevice.slotCount
    ) {
      eventForm.slotSideNumber = 1;
    }
    return;
  }

  eventForm.slotSideNumber = null;
}

function validateEventForm(): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!eventForm.filmStateCode) {
    errors.filmStateCode = 'Choose a target state.';
  }

  if (!occurredAtTimestamp.value) {
    errors.occurredAt = 'Occurred date and time is required.';
  }

  if (eventForm.filmStateCode === 'stored' && !eventForm.storageLocationId) {
    errors.storageLocationId = 'Select a storage location.';
  }

  if (eventForm.filmStateCode === 'loaded' && !eventForm.deviceId) {
    errors.deviceId = 'Select a device.';
  }
  if (props.isLargeFormatFilm && !eventForm.filmFrameId) {
    errors.filmFrameId = 'Select a frame.';
  }
  if (eventForm.filmStateCode === 'loaded' && eventForm.deviceId) {
    const selectedDevice = deviceStore.devices.find((entry) => entry.id === eventForm.deviceId);
    if (!selectedDevice) {
      errors.deviceId = 'Select a valid device.';
    }
    if (selectedDevice?.deviceTypeCode === 'film_holder') {
      if (typeof eventForm.slotSideNumber !== 'number' || !Number.isInteger(eventForm.slotSideNumber)) {
        errors.slotSideNumber = 'Select a holder slot.';
      } else if (eventForm.slotSideNumber < 1 || eventForm.slotSideNumber > selectedDevice.slotCount) {
        errors.slotSideNumber = `Slot must be between 1 and ${selectedDevice.slotCount}.`;
      }
    }
  }

  return errors;
}

function buildEventData(): Record<string, unknown> {
  switch (eventForm.filmStateCode) {
    case 'stored': {
      const location = referenceStore.storageLocations.find((entry) => entry.id === eventForm.storageLocationId);
      return {
        storageLocationId: eventForm.storageLocationId,
        storageLocationCode: location?.code ?? ''
      };
    }
    case 'loaded': {
      const selectedDevice = deviceStore.devices.find((entry) => entry.id === eventForm.deviceId);

      if (!selectedDevice) {
        return {};
      }

      if (selectedDevice.deviceTypeCode === 'camera') {
        return {
          loadTargetType: 'camera_direct',
          ...(props.isLargeFormatFilm ? { filmFrameId: eventForm.filmFrameId } : {}),
          cameraId: selectedDevice.id,
          intendedPushPull: eventForm.intendedPushPull
        };
      }

      if (selectedDevice.deviceTypeCode === 'interchangeable_back') {
        return {
          loadTargetType: 'interchangeable_back',
          ...(props.isLargeFormatFilm ? { filmFrameId: eventForm.filmFrameId } : {}),
          interchangeableBackId: selectedDevice.id,
          intendedPushPull: eventForm.intendedPushPull
        };
      }

      return {
        loadTargetType: 'film_holder_slot',
        ...(props.isLargeFormatFilm ? { filmFrameId: eventForm.filmFrameId } : {}),
        filmHolderId: selectedDevice.id,
        slotNumber: Number(eventForm.slotSideNumber ?? 1),
        intendedPushPull: eventForm.intendedPushPull
      };
    }
    case 'sent_for_dev':
      return {
        labName: eventForm.labName || null,
        labContact: eventForm.labContact || null,
        actualPushPull: eventForm.actualPushPull
      };
    case 'developed':
      return {
        labName: eventForm.labName || null,
        actualPushPull: eventForm.actualPushPull
      };
    case 'scanned':
      return {
        scannerOrSoftware: eventForm.scannerOrSoftware || null,
        scanLink: eventForm.scanLink || null
      };
    default:
      return {};
  }
}

async function submitEvent(): Promise<void> {
  if (isSavingEvent.value || !props.filmId) {
    return;
  }

  eventState.value.fieldErrors = validateEventForm();
  if (Object.keys(eventState.value.fieldErrors).length > 0) {
    eventState.value.formError = 'Please complete required fields before saving.';
    return;
  }

  const payloadBase = {
    occurredAt: new Date(occurredAtTimestamp.value as number).toISOString(),
    notes: eventForm.notes || undefined,
    eventData: buildEventData()
  };

  isSavingEvent.value = true;
  eventState.value.loading = true;
  eventState.value.formError = null;

  try {
    if (props.isLargeFormatFilm) {
      const frameId = eventForm.filmFrameId;
      if (!frameId) {
        throw new Error('Select a frame');
      }

      const payload: CreateFrameJourneyEventRequest = {
        frameStateCode: eventForm.filmStateCode as CreateFrameJourneyEventRequest['frameStateCode'],
        ...payloadBase
      };
      await filmStore.addFrameEvent(props.filmId, frameId, payload, pendingEventKey.value);
    } else {
      const payload: CreateFilmJourneyEventRequest = {
        filmStateCode: eventForm.filmStateCode as FilmStateCode,
        ...payloadBase
      };
      await filmStore.addEvent(props.filmId, payload, pendingEventKey.value);
    }

    pendingEventKey.value = createIdempotencyKey();
    isOpen.value = false;
    emit('saved');
    feedback.success('Event saved. Timeline updated.');
  } catch (error) {
    eventState.value.formError = feedback.toErrorMessage(error, 'Could not save this event.');
  } finally {
    isSavingEvent.value = false;
    eventState.value.loading = false;
  }
}

watch(
  () => props.show,
  (value) => {
    if (value) {
      pendingEventKey.value = createIdempotencyKey();
    }
  }
);
</script>

<template>
  <NDrawer v-model:show="isOpen" placement="right" width="min(100vw, 460px)">
    <NDrawerContent title="Add journey event" closable>
      <NForm label-placement="top" @submit.prevent="submitEvent">
        <NAlert v-if="eventState.formError" type="error" :show-icon="true" style="margin-bottom: 10px;">
          {{ eventState.formError }}
        </NAlert>

        <NGrid cols="1" :y-gap="4">
          <NGridItem>
            <NFormItem
              label="Target state"
              required
              :label-props="{ for: 'event-target-state-input' }"
              :feedback="eventState.fieldErrors.filmStateCode || ''"
            >
              <NSelect
                :value="eventForm.filmStateCode"
                :options="transitions"
                placeholder="Select next state"
                data-testid="event-target-state"
                :input-props="{ id: 'event-target-state-input', name: 'filmStateCode' }"
                @update:value="onChangeFilmState"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem
              label="Occurred at"
              required
              :label-props="{ for: 'event-occurred-at-input' }"
              :feedback="eventState.fieldErrors.occurredAt || ''"
            >
              <NDatePicker
                :value="occurredAtTimestamp"
                type="datetime"
                :input-props="{ id: 'event-occurred-at-input', name: 'occurredAt' }"
                @update:value="(value) => { occurredAtTimestamp = value; }"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem>
            <NFormItem label="Notes" :label-props="{ for: 'event-notes-input' }">
              <NInput
                :value="eventForm.notes"
                type="textarea"
                placeholder="Optional context"
                :input-props="{ id: 'event-notes-input', name: 'notes' }"
                @update:value="(value) => { eventForm.notes = value; }"
              />
            </NFormItem>
          </NGridItem>
        </NGrid>

        <NText depth="3">
          Fields below change based on the transition state, so only relevant inputs are shown.
        </NText>

        <NGrid cols="1" :y-gap="4">
          <NGridItem v-if="eventForm.filmStateCode === 'stored'">
            <NFormItem
              label="Storage location"
              required
              :label-props="{ for: 'event-storage-location-input' }"
              :feedback="eventState.fieldErrors.storageLocationId || ''"
            >
              <NSelect
                :value="eventForm.storageLocationId"
                :options="storageLocationOptions"
                placeholder="Select location"
                data-testid="event-storage-location"
                :input-props="{ id: 'event-storage-location-input', name: 'storageLocationId' }"
                @update:value="(value) => { eventForm.storageLocationId = value; }"
              />
            </NFormItem>
          </NGridItem>

          <NGridItem v-if="isLargeFormatFilm && eventForm.filmStateCode">
            <NFormItem
              label="Frame"
              required
              :label-props="{ for: 'event-film-unit-input' }"
              :feedback="eventState.fieldErrors.filmFrameId || ''"
            >
              <NSelect
                :value="eventForm.filmFrameId"
                :options="availableFrameOptions"
                placeholder="Select frame"
                :input-props="{ id: 'event-film-unit-input', name: 'filmFrameId' }"
                @update:value="(value) => { eventForm.filmFrameId = value; }"
              />
            </NFormItem>
          </NGridItem>

          <template v-if="eventForm.filmStateCode === 'loaded'">
            <NGridItem>
              <NFormItem
                label="Device"
                required
                :label-props="{ for: 'event-device-input' }"
                :feedback="eventState.fieldErrors.deviceId || ''"
              >
                <NSelect
                  :value="eventForm.deviceId"
                  :options="deviceOptions"
                  placeholder="Select device"
                  :input-props="{ id: 'event-device-input', name: 'deviceId' }"
                  @update:value="onChangeDevice"
                />
              </NFormItem>
            </NGridItem>
            <NGridItem v-if="selectedLoadDevice?.deviceTypeCode === 'film_holder'">
              <NFormItem
                label="Holder slot"
                required
                :label-props="{ for: 'event-slot-side-input' }"
                :feedback="eventState.fieldErrors.slotSideNumber || ''"
              >
                <NSelect
                  :value="eventForm.slotSideNumber"
                  :options="holderSlotOptions"
                  placeholder="Select holder slot"
                  :input-props="{ id: 'event-slot-side-input', name: 'slotSideNumber' }"
                  @update:value="(value) => { eventForm.slotSideNumber = value; }"
                />
              </NFormItem>
            </NGridItem>
            <NGridItem>
              <NFormItem label="Intended push/pull" :label-props="{ for: 'event-intended-push-pull-input' }">
                <NInputNumber
                  :value="eventForm.intendedPushPull"
                  :input-props="{ id: 'event-intended-push-pull-input', name: 'intendedPushPull' }"
                  @update:value="(value) => { eventForm.intendedPushPull = value; }"
                />
              </NFormItem>
            </NGridItem>
          </template>

          <template v-if="eventForm.filmStateCode === 'sent_for_dev'">
            <NGridItem>
              <NFormItem label="Lab name" :label-props="{ for: 'event-lab-name-sent-input' }">
                <NInput
                  :value="eventForm.labName"
                  :input-props="{ id: 'event-lab-name-sent-input', name: 'labName' }"
                  @update:value="(value) => { eventForm.labName = value; }"
                />
              </NFormItem>
            </NGridItem>
            <NGridItem>
              <NFormItem label="Lab contact" :label-props="{ for: 'event-lab-contact-input' }">
                <NInput
                  :value="eventForm.labContact"
                  :input-props="{ id: 'event-lab-contact-input', name: 'labContact' }"
                  @update:value="(value) => { eventForm.labContact = value; }"
                />
              </NFormItem>
            </NGridItem>
            <NGridItem>
              <NFormItem label="Actual push/pull" :label-props="{ for: 'event-actual-push-pull-sent-input' }">
                <NInputNumber
                  :value="eventForm.actualPushPull"
                  :input-props="{ id: 'event-actual-push-pull-sent-input', name: 'actualPushPull' }"
                  @update:value="(value) => { eventForm.actualPushPull = value; }"
                />
              </NFormItem>
            </NGridItem>
          </template>

          <template v-if="eventForm.filmStateCode === 'developed'">
            <NGridItem>
              <NFormItem label="Lab name" :label-props="{ for: 'event-lab-name-developed-input' }">
                <NInput
                  :value="eventForm.labName"
                  :input-props="{ id: 'event-lab-name-developed-input', name: 'labName' }"
                  @update:value="(value) => { eventForm.labName = value; }"
                />
              </NFormItem>
            </NGridItem>
            <NGridItem>
              <NFormItem label="Actual push/pull" :label-props="{ for: 'event-actual-push-pull-developed-input' }">
                <NInputNumber
                  :value="eventForm.actualPushPull"
                  :input-props="{ id: 'event-actual-push-pull-developed-input', name: 'actualPushPull' }"
                  @update:value="(value) => { eventForm.actualPushPull = value; }"
                />
              </NFormItem>
            </NGridItem>
          </template>

          <template v-if="eventForm.filmStateCode === 'scanned'">
            <NGridItem>
              <NFormItem label="Scanner or software" :label-props="{ for: 'event-scanner-software-input' }">
                <NInput
                  :value="eventForm.scannerOrSoftware"
                  :input-props="{ id: 'event-scanner-software-input', name: 'scannerOrSoftware' }"
                  @update:value="(value) => { eventForm.scannerOrSoftware = value; }"
                />
              </NFormItem>
            </NGridItem>
            <NGridItem>
              <NFormItem label="Scan link" :label-props="{ for: 'event-scan-link-input' }">
                <NInput
                  :value="eventForm.scanLink"
                  :input-props="{ id: 'event-scan-link-input', name: 'scanLink' }"
                  @update:value="(value) => { eventForm.scanLink = value; }"
                />
              </NFormItem>
            </NGridItem>
          </template>
        </NGrid>

        <NFlex justify="end">
          <NButton tertiary @click="isOpen = false">Cancel</NButton>
          <NButton type="primary" attr-type="submit" :loading="isSavingEvent" :disabled="isSavingEvent">
            Save event
          </NButton>
        </NFlex>
      </NForm>
    </NDrawerContent>
  </NDrawer>
</template>
