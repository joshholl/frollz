/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch, nextTick } from 'vue';
const props = defineProps();
const emit = defineEmits();
const panelRef = ref(null);
let triggerEl = null;
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const getFocusable = () => Array.from(panelRef.value?.querySelectorAll(FOCUSABLE_SELECTOR) ?? []);
const trapFocus = (e) => {
    if (e.key !== 'Tab')
        return;
    const focusable = getFocusable();
    if (focusable.length === 0)
        return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
        if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
        }
    }
    else {
        if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
};
watch(() => props.open, async (isOpen) => {
    if (isOpen) {
        triggerEl = document.activeElement;
        await nextTick();
        const focusable = getFocusable();
        (focusable[0] ?? panelRef.value)?.focus();
    }
    else {
        await nextTick();
        triggerEl?.focus();
        triggerEl = null;
    }
});
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
if (__VLS_ctx.open) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['items-end']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:items-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-opacity-75']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-opacity-80']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onKeydown: (...[$event]) => {
                if (!(__VLS_ctx.open))
                    return;
                __VLS_ctx.emit('close');
                // @ts-ignore
                [open, emit,];
            } },
        ...{ onKeydown: (__VLS_ctx.trapFocus) },
        ref: "panelRef",
        role: "dialog",
        'aria-modal': "true",
        'aria-labelledby': (__VLS_ctx.titleId),
        tabindex: "-1",
        ...{ class: "w-full rounded-t-2xl sm:rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6 max-h-[90vh] overflow-y-auto sm:max-w-lg sm:mx-4 focus:outline-none" },
    });
    /** @type {__VLS_StyleScopedClasses['w-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-t-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
    /** @type {__VLS_StyleScopedClasses['max-h-[90vh]']} */ ;
    /** @type {__VLS_StyleScopedClasses['overflow-y-auto']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:max-w-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['sm:mx-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
    var __VLS_0 = {};
}
// @ts-ignore
var __VLS_1 = __VLS_0;
// @ts-ignore
[trapFocus, titleId,];
const __VLS_base = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
const __VLS_export = {};
export default {};
