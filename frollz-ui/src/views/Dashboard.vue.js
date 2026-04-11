/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../../../.npm/_npx/2db181330ea4b15b/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { filmApi, emulsionApi } from '@/services/api-client';
import { currentStateName } from '@/types';
import StatCard from '@/components/StatCard.vue';
const loading = ref(true);
const hasError = ref(false);
const stats = ref({
    totalFilms: 0,
    totalEmulsions: 0,
    loadedFilms: 0,
    developedFilms: 0,
});
const recentFilms = ref([]);
const formatDate = (date) => new Date(date).toLocaleDateString();
const getStateName = (film) => currentStateName(film);
const getStateDate = (film) => {
    if (!film.states?.length)
        return null;
    const sorted = [...film.states].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0]?.date ?? null;
};
const loadStats = async () => {
    try {
        const [filmsResponse, emulsionsResponse] = await Promise.all([
            filmApi.getAll(),
            emulsionApi.getAll(),
        ]);
        const films = filmsResponse.data;
        stats.value.totalFilms = films.length;
        stats.value.totalEmulsions = emulsionsResponse.data.length;
        stats.value.loadedFilms = films.filter(f => getStateName(f) === 'Loaded').length;
        stats.value.developedFilms = films.filter(f => getStateName(f) === 'Developed' || getStateName(f) === 'Received').length;
        recentFilms.value = [...films]
            .sort((a, b) => {
            const aDate = getStateDate(a)?.getTime() ?? 0;
            const bDate = getStateDate(b)?.getTime() ?? 0;
            return bDate - aDate;
        })
            .slice(0, 5);
    }
    catch (error) {
        console.error('Error loading dashboard stats:', error);
        hasError.value = true;
    }
    finally {
        loading.value = false;
    }
};
onMounted(() => {
    loadStats();
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
__VLS_asFunctionalElement1(__VLS_intrinsics.h1, __VLS_intrinsics.h1)({
    ...{ class: "text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8" },
});
/** @type {__VLS_StyleScopedClasses['text-3xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-bold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-900']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-100']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    'aria-label': "Dashboard statistics",
    'aria-busy': (__VLS_ctx.loading),
    ...{ class: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['md:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-4']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-6']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-8']} */ ;
if (__VLS_ctx.loading) {
    for (const [n] of __VLS_vFor((4))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (n),
            ...{ class: "bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md animate-pulse" },
        });
        /** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
        /** @type {__VLS_StyleScopedClasses['p-6']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
        /** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
        /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" },
        });
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-3/4']} */ ;
        /** @type {__VLS_StyleScopedClasses['mb-3']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-9 bg-gray-200 dark:bg-gray-700 rounded w-1/2" },
        });
        /** @type {__VLS_StyleScopedClasses['h-9']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-1/2']} */ ;
        // @ts-ignore
        [loading, loading,];
    }
}
else {
    const __VLS_0 = StatCard;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
        label: "Total Films",
        value: (__VLS_ctx.stats.totalFilms),
        colorClass: "text-primary-600 dark:text-primary-400",
    }));
    const __VLS_2 = __VLS_1({
        label: "Total Films",
        value: (__VLS_ctx.stats.totalFilms),
        colorClass: "text-primary-600 dark:text-primary-400",
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_5 = StatCard;
    // @ts-ignore
    const __VLS_6 = __VLS_asFunctionalComponent1(__VLS_5, new __VLS_5({
        label: "Available Emulsions",
        value: (__VLS_ctx.stats.totalEmulsions),
        colorClass: "text-green-600 dark:text-green-400",
    }));
    const __VLS_7 = __VLS_6({
        label: "Available Emulsions",
        value: (__VLS_ctx.stats.totalEmulsions),
        colorClass: "text-green-600 dark:text-green-400",
    }, ...__VLS_functionalComponentArgsRest(__VLS_6));
    const __VLS_10 = StatCard;
    // @ts-ignore
    const __VLS_11 = __VLS_asFunctionalComponent1(__VLS_10, new __VLS_10({
        label: "Currently Loaded",
        value: (__VLS_ctx.stats.loadedFilms),
        colorClass: "text-yellow-700 dark:text-yellow-400",
    }));
    const __VLS_12 = __VLS_11({
        label: "Currently Loaded",
        value: (__VLS_ctx.stats.loadedFilms),
        colorClass: "text-yellow-700 dark:text-yellow-400",
    }, ...__VLS_functionalComponentArgsRest(__VLS_11));
    const __VLS_15 = StatCard;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent1(__VLS_15, new __VLS_15({
        label: "Developed",
        value: (__VLS_ctx.stats.developedFilms),
        colorClass: "text-blue-600 dark:text-blue-400",
    }));
    const __VLS_17 = __VLS_16({
        label: "Developed",
        value: (__VLS_ctx.stats.developedFilms),
        colorClass: "text-blue-600 dark:text-blue-400",
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
});
/** @type {__VLS_StyleScopedClasses['grid']} */ ;
/** @type {__VLS_StyleScopedClasses['grid-cols-1']} */ ;
/** @type {__VLS_StyleScopedClasses['lg:grid-cols-2']} */ ;
/** @type {__VLS_StyleScopedClasses['gap-8']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" },
    'aria-busy': (__VLS_ctx.loading),
});
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
if (__VLS_ctx.loading) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
        'aria-hidden': "true",
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    for (const [n] of __VLS_vFor((5))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (n),
            ...{ class: "animate-pulse flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0" },
        });
        /** @type {__VLS_StyleScopedClasses['animate-pulse']} */ ;
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['last:border-b-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "space-y-2" },
        });
        /** @type {__VLS_StyleScopedClasses['space-y-2']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" },
        });
        /** @type {__VLS_StyleScopedClasses['h-4']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-24']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" },
        });
        /** @type {__VLS_StyleScopedClasses['h-3']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-16']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ class: "h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" },
        });
        /** @type {__VLS_StyleScopedClasses['h-5']} */ ;
        /** @type {__VLS_StyleScopedClasses['bg-gray-200']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
        /** @type {__VLS_StyleScopedClasses['w-20']} */ ;
        // @ts-ignore
        [loading, loading, stats, stats, stats, stats,];
    }
}
else if (__VLS_ctx.hasError) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "py-4 text-sm text-red-600 dark:text-red-400" },
    });
    /** @type {__VLS_StyleScopedClasses['py-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-red-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:text-red-400']} */ ;
}
else if (__VLS_ctx.recentFilms.length === 0) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "py-8 text-center" },
    });
    /** @type {__VLS_StyleScopedClasses['py-8']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-center']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
        ...{ class: "text-gray-500 dark:text-gray-400 mb-4" },
    });
    /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
    /** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
    /** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
    let __VLS_20;
    /** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
    RouterLink;
    // @ts-ignore
    const __VLS_21 = __VLS_asFunctionalComponent1(__VLS_20, new __VLS_20({
        to: "/rolls?action=create",
        ...{ class: "inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium text-sm" },
    }));
    const __VLS_22 = __VLS_21({
        to: "/rolls?action=create",
        ...{ class: "inline-block bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-medium text-sm" },
    }, ...__VLS_functionalComponentArgsRest(__VLS_21));
    /** @type {__VLS_StyleScopedClasses['inline-block']} */ ;
    /** @type {__VLS_StyleScopedClasses['bg-primary-600']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-white']} */ ;
    /** @type {__VLS_StyleScopedClasses['px-4']} */ ;
    /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
    /** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
    /** @type {__VLS_StyleScopedClasses['hover:bg-primary-700']} */ ;
    /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
    /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
    const { default: __VLS_25 } = __VLS_23.slots;
    // @ts-ignore
    [hasError, recentFilms,];
    var __VLS_23;
}
else {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "space-y-4" },
    });
    /** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
    for (const [film] of __VLS_vFor((__VLS_ctx.recentFilms))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            key: (film.id),
            ...{ class: "flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0" },
        });
        /** @type {__VLS_StyleScopedClasses['flex']} */ ;
        /** @type {__VLS_StyleScopedClasses['justify-between']} */ ;
        /** @type {__VLS_StyleScopedClasses['items-center']} */ ;
        /** @type {__VLS_StyleScopedClasses['py-2']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-b']} */ ;
        /** @type {__VLS_StyleScopedClasses['border-gray-100']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:border-gray-700']} */ ;
        /** @type {__VLS_StyleScopedClasses['last:border-b-0']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({});
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "font-medium" },
        });
        /** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
        (film.name);
        __VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({
            ...{ class: "text-sm text-gray-500 dark:text-gray-400" },
        });
        /** @type {__VLS_StyleScopedClasses['text-sm']} */ ;
        /** @type {__VLS_StyleScopedClasses['text-gray-500']} */ ;
        /** @type {__VLS_StyleScopedClasses['dark:text-gray-400']} */ ;
        (__VLS_ctx.getStateName(film));
        if (__VLS_ctx.getStateDate(film)) {
            __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
                ...{ class: "px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs" },
            });
            /** @type {__VLS_StyleScopedClasses['px-2']} */ ;
            /** @type {__VLS_StyleScopedClasses['py-1']} */ ;
            /** @type {__VLS_StyleScopedClasses['bg-gray-100']} */ ;
            /** @type {__VLS_StyleScopedClasses['dark:bg-gray-700']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
            /** @type {__VLS_StyleScopedClasses['dark:text-gray-200']} */ ;
            /** @type {__VLS_StyleScopedClasses['rounded-full']} */ ;
            /** @type {__VLS_StyleScopedClasses['text-xs']} */ ;
            (__VLS_ctx.formatDate(__VLS_ctx.getStateDate(film)));
        }
        // @ts-ignore
        [recentFilms, getStateName, getStateDate, getStateDate, formatDate,];
    }
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" },
});
/** @type {__VLS_StyleScopedClasses['bg-white']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:bg-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-lg']} */ ;
/** @type {__VLS_StyleScopedClasses['shadow-md']} */ ;
/** @type {__VLS_StyleScopedClasses['p-6']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({
    ...{ class: "text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4" },
});
/** @type {__VLS_StyleScopedClasses['text-xl']} */ ;
/** @type {__VLS_StyleScopedClasses['font-semibold']} */ ;
/** @type {__VLS_StyleScopedClasses['text-gray-800']} */ ;
/** @type {__VLS_StyleScopedClasses['dark:text-gray-200']} */ ;
/** @type {__VLS_StyleScopedClasses['mb-4']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "space-y-4" },
});
/** @type {__VLS_StyleScopedClasses['space-y-4']} */ ;
let __VLS_26;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
    to: "/rolls?action=create",
    ...{ class: "block w-full bg-primary-600 text-white text-center py-3 px-4 rounded-md hover:bg-primary-700 font-medium" },
}));
const __VLS_28 = __VLS_27({
    to: "/rolls?action=create",
    ...{ class: "block w-full bg-primary-600 text-white text-center py-3 px-4 rounded-md hover:bg-primary-700 font-medium" },
}, ...__VLS_functionalComponentArgsRest(__VLS_27));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-primary-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-primary-700']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
const { default: __VLS_31 } = __VLS_29.slots;
// @ts-ignore
[];
var __VLS_29;
let __VLS_32;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_33 = __VLS_asFunctionalComponent1(__VLS_32, new __VLS_32({
    to: "/stocks?action=create",
    ...{ class: "block w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 font-medium" },
}));
const __VLS_34 = __VLS_33({
    to: "/stocks?action=create",
    ...{ class: "block w-full bg-green-600 text-white text-center py-3 px-4 rounded-md hover:bg-green-700 font-medium" },
}, ...__VLS_functionalComponentArgsRest(__VLS_33));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-green-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-green-700']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
const { default: __VLS_37 } = __VLS_35.slots;
// @ts-ignore
[];
var __VLS_35;
let __VLS_38;
/** @ts-ignore @type {typeof __VLS_components.RouterLink | typeof __VLS_components.RouterLink} */
RouterLink;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    to: "/formats?action=create",
    ...{ class: "block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 font-medium" },
}));
const __VLS_40 = __VLS_39({
    to: "/formats?action=create",
    ...{ class: "block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-md hover:bg-blue-700 font-medium" },
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['bg-blue-600']} */ ;
/** @type {__VLS_StyleScopedClasses['text-white']} */ ;
/** @type {__VLS_StyleScopedClasses['text-center']} */ ;
/** @type {__VLS_StyleScopedClasses['py-3']} */ ;
/** @type {__VLS_StyleScopedClasses['px-4']} */ ;
/** @type {__VLS_StyleScopedClasses['rounded-md']} */ ;
/** @type {__VLS_StyleScopedClasses['hover:bg-blue-700']} */ ;
/** @type {__VLS_StyleScopedClasses['font-medium']} */ ;
const { default: __VLS_43 } = __VLS_41.slots;
// @ts-ignore
[];
var __VLS_41;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
