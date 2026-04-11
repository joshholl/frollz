/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { RouterView } from 'vue-router';
import NavBar from '@/components/NavBar.vue';
import AppAnnouncer from '@/components/AppAnnouncer.vue';
import { useThemeStore } from '@/stores/theme';
useThemeStore();
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    id: "app",
    ...{ class: "min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100" },
});
/** @type {__VLS_StyleScopedClasses['min-h-screen']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-gray-50']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-100']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.a, __VLS_intrinsics.a)({
    href: "#main-content",
    ...{ class: "sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-md focus:font-medium focus:shadow-lg" },
});
/** @type {__VLS_StyleScopedClasses['sr-only']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:not-sr-only']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:fixed']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:top-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:left-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:z-[100]']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:py-2']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:bg-primary-600']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:font-medium']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:shadow-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.header, __VLS_intrinsics.header)({});
const __VLS_0 = NavBar;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({}));
const __VLS_2 = __VLS_1({}, ...__VLS_functionalComponentArgsRest(__VLS_1));
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    id: "main-content",
    tabindex: "-1",
    ...{ class: "max-w-screen-xl mx-auto page-x py-8 focus:outline-none" },
});
/** @type {__VLS_StyleScopedClasses['max-w-screen-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['page-x']} */ ;
/** @type {__VLS_StyleScopedClasses['py-8']} */ ;
/** @type {__VLS_StyleScopedClasses['focus:outline-none']} */ ;
let __VLS_5;
/** @ts-ignore @type {typeof __VLS_components.RouterView} */
RouterView;
// @ts-ignore
const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({}));
const __VLS_7 = __VLS_6({}, ...__VLS_functionalComponentArgsRest(__VLS_6));
__VLS_asFunctionalElement1(__VLS_intrinsics.footer, __VLS_intrinsics.footer)({
    ...{ class: "py-4 text-center text-sm text-gray-600 dark:text-gray-500" },
});
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-600']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-500']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({});
const __VLS_10 = AppAnnouncer;
// @ts-ignore
const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({}));
const __VLS_12 = __VLS_11({}, ...__VLS_functionalComponentArgsRest(__VLS_11));
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
