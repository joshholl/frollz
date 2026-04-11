/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, computed, useId } from 'vue';
import { buildSuggestions } from '@/utils/brandSuggestions';
defineOptions({ inheritAttrs: false });
const uid = useId();
const listboxId = `typeahead-listbox-${uid}`;
const optionId = (i) => `typeahead-option-${uid}-${i}`;
const props = defineProps();
const emit = defineEmits();
const inputValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
});
const dbOptions = ref([]);
const isOpen = ref(false);
const highlightedIndex = ref(-1);
let debounceTimer = null;
const suggestions = computed(() => buildSuggestions(inputValue.value, dbOptions.value));
const onInput = () => {
    isOpen.value = true;
    highlightedIndex.value = -1;
    if (debounceTimer)
        clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchOptions(), 200);
};
const fetchOptions = async () => {
    if (!inputValue.value.trim()) {
        dbOptions.value = [];
        return;
    }
    try {
        dbOptions.value = await props.fetchOptions(inputValue.value);
    }
    catch {
        dbOptions.value = [];
    }
};
const select = (value) => {
    inputValue.value = value;
    close();
};
const close = () => {
    isOpen.value = false;
    highlightedIndex.value = -1;
};
const onBlur = () => {
    setTimeout(() => close(), 150);
};
const onFocus = () => {
    if (inputValue.value.trim()) {
        isOpen.value = true;
    }
};
const moveDown = () => {
    if (!isOpen.value)
        return;
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, suggestions.value.length - 1);
};
const moveUp = () => {
    if (!isOpen.value)
        return;
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1);
};
const selectHighlighted = () => {
    if (highlightedIndex.value >= 0 && highlightedIndex.value < suggestions.value.length) {
        select(suggestions.value[highlightedIndex.value]);
    }
};
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "relative" },
});
/** @type {__VLS_StyleScopedClasses['relative']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.input)({
    ...{ onInput: (__VLS_ctx.onInput) },
    ...{ onKeydown: (__VLS_ctx.close) },
    ...{ onKeydown: (__VLS_ctx.moveDown) },
    ...{ onKeydown: (__VLS_ctx.moveUp) },
    ...{ onKeydown: (__VLS_ctx.selectHighlighted) },
    ...{ onBlur: (__VLS_ctx.onBlur) },
    ...{ onFocus: (__VLS_ctx.onFocus) },
    value: (__VLS_ctx.inputValue),
    type: "text",
    role: "combobox",
    'aria-expanded': (__VLS_ctx.isOpen && __VLS_ctx.suggestions.length > 0),
    'aria-autocomplete': "list",
    'aria-controls': (__VLS_ctx.listboxId),
    'aria-activedescendant': (__VLS_ctx.highlightedIndex >= 0 ? __VLS_ctx.optionId(__VLS_ctx.highlightedIndex) : undefined),
});
(__VLS_ctx.$attrs);
__VLS_asFunctionalElement1(__VLS_intrinsics.ul, __VLS_intrinsics.ul)({
    id: (__VLS_ctx.listboxId),
    role: "listbox",
    ...{ class: "absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.isOpen && __VLS_ctx.suggestions.length > 0) }, null, null);
/** @type {__VLS_StyleScopedClasses['absolute']} */ ;
/** @type {__VLS_StyleScopedClasses['z-10']} */ ;
/** @type {__VLS_StyleScopedClasses['mt-1']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['border']} */ ;
/** @type {__VLS_StyleScopedClasses['border-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:border-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['max-h-60']} */ ;
/** @type {__VLS_StyleScopedClasses['overflow-auto']} */ ;
for (const [suggestion, i] of __VLS_vFor((__VLS_ctx.suggestions))) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.li, __VLS_intrinsics.li)({
        ...{ onPointerdown: (...[$event]) => {
                __VLS_ctx.select(suggestion);
                // @ts-ignore
                [onInput, close, moveDown, moveUp, selectHighlighted, onBlur, onFocus, inputValue, isOpen, isOpen, suggestions, suggestions, suggestions, listboxId, listboxId, highlightedIndex, highlightedIndex, optionId, $attrs, select,];
            } },
        key: (suggestion),
        id: (__VLS_ctx.optionId(i)),
        role: "option",
        'aria-selected': (i === __VLS_ctx.highlightedIndex),
        ...{ class: "px-3 py-2 text-sm cursor-pointer" },
        ...{ class: (i === __VLS_ctx.highlightedIndex
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                : 'text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-600') },
    });
    /** @type {__VLS_StyleScopedClasses['px-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['cursor-pointer']} */ ;
    (suggestion);
    // @ts-ignore
    [highlightedIndex, highlightedIndex, optionId,];
}
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
export default {};
