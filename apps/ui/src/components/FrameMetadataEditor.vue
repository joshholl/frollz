<template>
  <div class="column q-gutter-sm q-pa-md bg-grey-2">
    <q-select
      v-model="form.aperturePreset"
      :options="apertureOptions"
      emit-value
      map-options
      label="Aperture"
      filled
      dense
      clearable
      :disable="readonly"
    />
    <q-input
      v-if="form.aperturePreset === null"
      v-model="form.apertureCustom"
      label="Custom aperture (e.g. 3.5)"
      type="number"
      filled
      dense
      :disable="readonly"
    />

    <q-input
      v-model="form.shutterInput"
      label="Shutter speed (e.g. 1/500 or 2.5)"
      filled
      dense
      clearable
      :disable="readonly"
      :hint="shutterDisplayHint"
    />

    <q-checkbox
      v-model="form.filterUsed"
      :indeterminate-value="null"
      toggle-indeterminate
      label="Filter used"
      :disable="readonly"
    />

    <div class="text-caption">
      <span v-if="saveStatus === 'pending'" class="text-grey-6">Saving…</span>
      <span v-else-if="saveStatus === 'saving'" class="text-grey-6">
        <q-spinner size="xs" /> Saving…
      </span>
      <span v-else-if="saveStatus === 'saved'" class="text-positive">Saved</span>
      <span v-else-if="saveStatus === 'error'" class="text-negative">
        {{ saveError }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive } from 'vue';
import { APERTURE_PRESETS, type AperturePreset, type FilmFrame, type UpdateFilmFrameRequest } from '@frollz2/schema';
import { useFrameMetadataAutosave } from '../composables/useFrameMetadataAutosave.js';
import { parseShutterSpeedInput, formatShutterSpeed } from '../utils/shutterSpeed.js';

const apertureOptions = [
  ...APERTURE_PRESETS.map((v) => ({ label: `f/${v}`, value: v })),
  { label: 'Other…', value: null }
];

interface Props {
  frame: FilmFrame;
  filmId: number;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
});

const form = reactive({
  aperturePreset: null as number | null,
  apertureCustom: '',
  shutterInput: '',
  filterUsed: null as boolean | null
});

const resolvedAperture = computed((): number | null => {
  if (form.aperturePreset !== null) return form.aperturePreset;
  const parsed = parseFloat(form.apertureCustom);
  return isFinite(parsed) && parsed > 0 ? parsed : null;
});

const shutterDisplayHint = computed(() => {
  if (!form.shutterInput.trim()) return '';
  const parsed = parseShutterSpeedInput(form.shutterInput);
  if (parsed === null) return 'Invalid format';
  return formatShutterSpeed(parsed);
});

const patch = computed((): UpdateFilmFrameRequest => ({
  aperture: resolvedAperture.value,
  shutterSpeedSeconds: parseShutterSpeedInput(form.shutterInput),
  filterUsed: form.filterUsed
}));

const filmIdRef = computed(() => props.filmId);
const frameIdRef = computed(() => props.frame.id);
const { saveStatus, saveError, flush } = useFrameMetadataAutosave(
  filmIdRef,
  frameIdRef,
  patch
);

onMounted(() => {
  if (props.frame.aperture !== null) {
    const isPreset = APERTURE_PRESETS.includes(props.frame.aperture as AperturePreset);
    if (isPreset) {
      form.aperturePreset = props.frame.aperture;
    } else {
      form.aperturePreset = null;
      form.apertureCustom = String(props.frame.aperture);
    }
  }
  if (props.frame.shutterSpeedSeconds !== null) {
    form.shutterInput = formatShutterSpeed(props.frame.shutterSpeedSeconds);
  }
  form.filterUsed = props.frame.filterUsed;
});

onBeforeUnmount(async () => {
  await flush();
});
</script>
