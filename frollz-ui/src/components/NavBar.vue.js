/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline';
import { Bars3Icon } from '@heroicons/vue/24/outline';
import { useThemeStore } from '@/stores/theme';
const themeStore = useThemeStore();
const navLinks = [
    { to: '/', name: 'dashboard', label: 'Dashboard' },
    { to: '/formats', name: 'formats', label: 'Film Formats' },
    { to: '/stocks', name: 'stocks', label: 'Stocks' },
    { to: '/rolls', name: 'rolls', label: 'Rolls' },
    { to: '/tags', name: 'tags', label: 'Tags' },
];
const menuOpen = ref(false);
const hamburgerRef = ref(null);
const drawerRef = ref(null);
function openMenu() {
    menuOpen.value = true;
}
function closeMenu() {
    menuOpen.value = false;
}
// Focus first drawer element on open; return focus to hamburger on close.
// Also lock body scroll while drawer is open.
watch(menuOpen, async (open) => {
    if (open) {
        document.body.style.overflow = 'hidden';
        await nextTick();
        const first = drawerRef.value?.querySelector('a, button, [tabindex="0"]');
        first?.focus();
    }
    else {
        document.body.style.overflow = '';
        hamburgerRef.value?.focus();
    }
});
// Tab trap + Escape handler for the drawer
function handleKeydown(e) {
    if (e.key === 'Escape') {
        closeMenu();
        return;
    }
    if (e.key !== 'Tab')
        return;
    const focusable = Array.from(drawerRef.value?.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]') ?? []);
    if (!focusable.length)
        return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
    }
    else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
    }
}
// Close drawer automatically when viewport expands past md breakpoint
const mdQuery = window.matchMedia('(min-width: 768px)');
const onBreakpoint = (e) => { if (e.matches)
    closeMenu(); };
onMounted(() => mdQuery.addEventListener('change', onBreakpoint));
onUnmounted(() => {
    mdQuery.removeEventListener('change', onBreakpoint);
    // Restore scroll lock in case component unmounts while drawer is open
    document.body.style.overflow = '';
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
/** @type {__VLS_StyleScopedClasses['drawer-link']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
    'aria-label': "Main navigation",
    ...{ class: "bg-white dark:bg-gray-800 shadow-lg" },
});
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-lg']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "max-w-screen-xl mx-auto page-x" },
});
/** @type {__VLS_StyleScopedClasses['max-w-screen-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['mx-auto']} */ ;
/** @type {__VLS_StyleScopedClasses['page-x']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex justify-between items-center py-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center space-x-4" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-2xl font-bold text-primary-600 dark:text-primary-400" },
});
/** @type {__VLS_StyleScopedClasses['text-2xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-primary-600']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-primary-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "text-gray-500 dark:text-gray-400" },
});
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "hidden md:flex items-center space-x-6" },
});
/** @type {__VLS_StyleScopedClasses['hidden']} */ ;
/** @type {__VLS_StyleScopedClasses['md:flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['space-x-6']} */ ;
for (const [link] of __VLS_vFor((__VLS_ctx.navLinks))) {
    let __VLS_0;
    /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        key: (link.to),
        to: (link.to),
        ...{ class: "nav-link" },
        ...{ class: ({ active: __VLS_ctx.$route.name === link.name }) },
    }));
    const __VLS_2 = __VLS_1({
        key: (link.to),
        to: (link.to),
        ...{ class: "nav-link" },
        ...{ class: ({ active: __VLS_ctx.$route.name === link.name }) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    /** @type {__VLS_StyleScopedClasses['nav-link']} */ ;
    /** @type {__VLS_StyleScopedClasses['active']} */ ;
    const { default: __VLS_5 } = __VLS_3.slots;
    (link.label);
    // @ts-ignore
    [navLinks, $route,];
    var __VLS_3;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.themeStore.toggle();
            // @ts-ignore
            [themeStore,];
        } },
    ...{ class: "inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" },
    'aria-label': (__VLS_ctx.themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'),
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-[44px]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:hover:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
if (__VLS_ctx.themeStore.isDark) {
    let __VLS_6;
    /** @ts-ignore @type {typeof __VLS_components.SunIcon} */
    SunIcon;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
        ...{ class: "w-5 h-5" },
    }));
    const __VLS_8 = __VLS_7({
        ...{ class: "w-5 h-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
}
else {
    let __VLS_11;
    /** @ts-ignore @type {typeof __VLS_components.MoonIcon} */
    MoonIcon;
    // @ts-ignore
    const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
        ...{ class: "w-5 h-5" },
    }));
    const __VLS_13 = __VLS_12({
        ...{ class: "w-5 h-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_12));
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "flex items-center gap-2 md:hidden" },
});
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-2']} */ ;
/** @type {__VLS_StyleScopedClasses['md:hidden']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (...[$event]) => {
            __VLS_ctx.themeStore.toggle();
            // @ts-ignore
            [themeStore, themeStore, themeStore,];
        } },
    ...{ class: "inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" },
    'aria-label': (__VLS_ctx.themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'),
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-[44px]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:hover:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
if (__VLS_ctx.themeStore.isDark) {
    let __VLS_16;
    /** @ts-ignore @type {typeof __VLS_components.SunIcon} */
    SunIcon;
    // @ts-ignore
    const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
        ...{ class: "w-5 h-5" },
    }));
    const __VLS_18 = __VLS_17({
        ...{ class: "w-5 h-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_17));
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
}
else {
    let __VLS_21;
    /** @ts-ignore @type {typeof __VLS_components.MoonIcon} */
    MoonIcon;
    // @ts-ignore
    const __VLS_22 = __VLS_asFunctionalComponent1(__VLS_21, new __VLS_21({
        ...{ class: "w-5 h-5" },
    }));
    const __VLS_23 = __VLS_22({
        ...{ class: "w-5 h-5" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_22));
    /** @type {__VLS_StyleScopedClasses['w-5']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.openMenu) },
    ref: "hamburgerRef",
    'aria-label': "Open navigation",
    'aria-expanded': (__VLS_ctx.menuOpen),
    'aria-controls': "mobile-nav-drawer",
    ...{ class: "inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200" },
});
/** @type {__VLS_StyleScopedClasses['inline-flex']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['min-h-[44px]']} */ ;
/** @type {__VLS_StyleScopedClasses['min-w-[44px]']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:hover:bg-gray-700']} */ ;
/** @type {__VLS_StyleScopedClasses['transition-colors']} */ ;
/** @type {__VLS_StyleScopedClasses['duration-200']} */ ;
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.Bars3Icon} */
Bars3Icon;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    ...{ class: "w-6 h-6" },
}));
const __VLS_28 = __VLS_27({
    ...{ class: "w-6 h-6" },
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
/** @type {__VLS_StyleScopedClasses['w-6']} */ ;
/** @type {__VLS_StyleScopedClasses['h-6']} */ ;
let __VLS_31;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
    name: "fade",
}));
const __VLS_33 = __VLS_32({
    name: "fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_32));
const { default: __VLS_36 } = __VLS_34.slots;
if (__VLS_ctx.menuOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ onClick: (__VLS_ctx.closeMenu) },
        'data-testid': "nav-backdrop",
        ...{ class: "fixed inset-0 bg-black/50 z-40" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['inset-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-black/50']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-40']} */ ;
}
// @ts-ignore
[themeStore, themeStore, openMenu, menuOpen, menuOpen, closeMenu,];
var __VLS_34;
let __VLS_37;
/** @ts-ignore @type {typeof __VLS_components.Transition | typeof __VLS_components.Transition} */
Transition;
// @ts-ignore
const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
    name: "slide-up",
}));
const __VLS_39 = __VLS_38({
    name: "slide-up",
}, ...__VLS_functionalComponentArgsRest(__VLS_38));
const { default: __VLS_42 } = __VLS_40.slots;
if (__VLS_ctx.menuOpen) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ onKeydown: (__VLS_ctx.handleKeydown) },
        id: "mobile-nav-drawer",
        ref: "drawerRef",
        role: "dialog",
        'aria-modal': "true",
        'aria-label': "Navigation menu",
        ...{ class: "fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl z-50" },
    });
    /** @type {__VLS_StyleScopedClasses['fixed']} */ ;
    /** @type {__VLS_StyleScopedClasses['bottom-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['left-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['right-0']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-t-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['shadow-2xl']} */ ;
    /** @type {__VLS_StyleScopedClasses['z-50']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "flex justify-center pt-3 pb-2" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['flex']} */ ;
    /** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-3']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-2']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div)({
        ...{ class: "w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" },
    });
    /** @type {__VLS_StyleScopedClasses['w-10']} */ ;
    /** @type {__VLS_StyleScopedClasses['h-1']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-gray-300']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:bg-gray-600']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.nav, __VLS_intrinsics.nav)({
        'aria-label': "Mobile navigation",
        ...{ class: "page-x pt-2 pb-[max(2rem,env(safe-area-inset-bottom))] space-y-1" },
    });
    /** @type {__VLS_StyleScopedClasses['page-x']} */ ;
    /** @type {__VLS_StyleScopedClasses['pt-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['pb-[max(2rem,env(safe-area-inset-bottom))]']} */ ;
    /** @type {__VLS_StyleScopedClasses['space-y-1']} */ ;
    for (const [link] of __VLS_vFor((__VLS_ctx.navLinks))) {
        let __VLS_43;
        /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
        RouterLink;
        // @ts-ignore
        const __VLS_44 = __VLS_asFunctionalComponent1(__VLS_43, new __VLS_43({
            ...{ 'onClick': {} },
            key: (link.to),
            to: (link.to),
            ...{ class: "drawer-link" },
            ...{ class: ({ active: __VLS_ctx.$route.name === link.name }) },
        }));
        const __VLS_45 = __VLS_44({
            ...{ 'onClick': {} },
            key: (link.to),
            to: (link.to),
            ...{ class: "drawer-link" },
            ...{ class: ({ active: __VLS_ctx.$route.name === link.name }) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_44));
        let __VLS_48;
        const __VLS_49 = ({ click: {} },
            { onClick: (__VLS_ctx.closeMenu) });
        /** @type {__VLS_StyleScopedClasses['drawer-link']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        const { default: __VLS_50 } = __VLS_46.slots;
        (link.label);
        // @ts-ignore
        [navLinks, $route, menuOpen, closeMenu, handleKeydown,];
        var __VLS_46;
        var __VLS_47;
        // @ts-ignore
        [];
    }
}
// @ts-ignore
[];
var __VLS_40;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
