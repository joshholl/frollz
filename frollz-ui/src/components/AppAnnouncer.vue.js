/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed } from 'vue';
import { useNotificationStore } from '@/stores/notification';
const store = useNotificationStore();
const politeMessage = computed(() => (store.type === 'success' ? store.message : ''));
const assertiveMessage = computed(() => (store.type === 'error' ? store.message : ''));
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    role: "status",
    'aria-live': "polite",
    'aria-atomic': "true",
    ...{ class: "sr-only" },
});
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
(__VLS_ctx.politeMessage);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    role: "alert",
    'aria-live': "assertive",
    'aria-atomic': "true",
    ...{ class: "sr-only" },
});
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
(__VLS_ctx.assertiveMessage);
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    enterActiveClass: "transition duration-200 ease-out",
    enterFromClass: "translate-y-2 opacity-0",
    leaveActiveClass: "transition duration-150 ease-in",
    leaveToClass: "translate-y-2 opacity-0",
}));
const __VLS_2 = __VLS_1({
    enterActiveClass: "transition duration-200 ease-out",
    enterFromClass: "translate-y-2 opacity-0",
    leaveActiveClass: "transition duration-150 ease-in",
    leaveToClass: "translate-y-2 opacity-0",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
if (__VLS_ctx.store.message) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        'aria-hidden': "true",
        ...{ class: "fixed bottom-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white" },
        ...{ class: (__VLS_ctx.store.type === 'success' ? 'bg-green-600 dark:bg-green-700' : 'bg-red-600 dark:bg-red-700') },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-[60]']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    (__VLS_ctx.store.message);
}
// @ts-ignore
[politeMessage, assertiveMessage, store, store, store,];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
