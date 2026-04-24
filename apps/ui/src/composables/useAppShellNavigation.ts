import { computed, h, onBeforeUnmount, onMounted, ref, watch, type Component } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NBadge, NIcon, type MenuOption } from 'naive-ui';
import {
  Camera,
  CircleDot,
  Contrast2,
  Frame,
  Home,
  Movie,
  Photo,
  Rectangle,
  Replace,
  SwitchHorizontal
} from '@vicons/tabler';
import { useDeviceStore } from '../stores/devices.js';
import { useFilmStore } from '../stores/film.js';
import { useReferenceStore } from '../stores/reference.js';
import { DashboardIcon, DeviceIcon, EmulsionIcon, FilmIcon } from '../components/shell/icons.js';

const SIDEBAR_COLLAPSED_KEY = 'frollz.shell.sider.collapsed';
const LAST_ACTIVE_SECTION_KEY = 'frollz.shell.last-section';
const MOBILE_BREAKPOINT = 900;

const navIconByKey = {
  dashboard: DashboardIcon,
  film: FilmIcon,
  devices: DeviceIcon,
  emulsions: EmulsionIcon
} as const;

const subNavIconByPath = {
  '/devices/cameras': Camera,
  '/devices/film-holders': Rectangle,
  '/devices/interchangeable-backs': SwitchHorizontal,
  '/emulsions/black-and-white': CircleDot,
  '/emulsions/black-and-white-reversal': Contrast2,
  '/emulsions/cine-ecn2': Movie,
  '/emulsions/color-negative-c41': Photo,
  '/emulsions/color-positive-e6': Replace,
  '/film/35mm': Camera,
  '/film/medium-format': Frame,
  '/film/large-format-4x5': Rectangle,
  '/film/large-format-8x10': Rectangle
} as const;

export type BreadcrumbItem = {
  key: string;
  label: string;
  to?: string;
  isCurrent?: boolean;
  icon?: Component;
  ariaLabel?: string;
};

export function useAppShellNavigation() {
  const deviceStore = useDeviceStore();
  const filmStore = useFilmStore();
  const referenceStore = useReferenceStore();
  const route = useRoute();
  const router = useRouter();

  const isMobile = ref(false);
  const isMobileMenuOpen = ref(false);
  const isSidebarCollapsed = ref(false);
  const lastActiveSection = ref<string | null>(null);
  const expandedKeys = ref<string[]>([]);

  const navRoutes = computed(() =>
    router
      .getRoutes()
      .filter((record) => record.meta.layout === 'app' && record.meta.showInNav)
      .sort((a, b) => {
        const orderA = Number(a.meta.order) || 0;
        const orderB = Number(b.meta.order) || 0;

        if (orderA === orderB) {
          return a.path.localeCompare(b.path);
        }

        return orderA - orderB;
      })
  );

  const parentNavRoutes = computed(() =>
    navRoutes.value.filter((record) => typeof record.meta.navParent !== 'string')
  );

  const childRoutesByParent = computed(() => {
    const grouped = new Map<string, typeof navRoutes.value>();

    for (const routeRecord of navRoutes.value) {
      if (typeof routeRecord.meta.navParent !== 'string') {
        continue;
      }

      const existing = grouped.get(routeRecord.meta.navParent) ?? [];
      existing.push(routeRecord);
      grouped.set(routeRecord.meta.navParent, existing);
    }

    return grouped;
  });

  const deviceCountByType = computed(() =>
    deviceStore.devices.reduce<Record<string, number>>((counts, device) => {
      counts[device.deviceTypeCode] = (counts[device.deviceTypeCode] ?? 0) + 1;
      return counts;
    }, {})
  );

  const emulsionCountByProcess = computed(() =>
    referenceStore.emulsions.reduce<Record<string, number>>((counts, emulsion) => {
      const code = emulsion.developmentProcess.code;
      counts[code] = (counts[code] ?? 0) + 1;
      return counts;
    }, {})
  );

  const filmCountByFormat = computed(() =>
    filmStore.films.reduce<Record<string, number>>((counts, film) => {
      const code = film.filmFormat.code;
      counts[code] = (counts[code] ?? 0) + 1;
      return counts;
    }, {})
  );

  function badgeCountForRoute(path: string): number | undefined {
    switch (path) {
      case '/devices/cameras':
        return deviceCountByType.value['camera'] ?? 0;
      case '/devices/film-holders':
        return deviceCountByType.value['film_holder'] ?? 0;
      case '/devices/interchangeable-backs':
        return deviceCountByType.value['interchangeable_back'] ?? 0;
      case '/emulsions/black-and-white':
        return emulsionCountByProcess.value['BW'] ?? 0;
      case '/emulsions/black-and-white-reversal':
        return emulsionCountByProcess.value['BWReversal'] ?? 0;
      case '/emulsions/cine-ecn2':
        return emulsionCountByProcess.value['ECN2'] ?? 0;
      case '/emulsions/color-negative-c41':
        return emulsionCountByProcess.value['C41'] ?? 0;
      case '/emulsions/color-positive-e6':
        return emulsionCountByProcess.value['E6'] ?? 0;
      case '/film/35mm':
        return filmCountByFormat.value['35mm'] ?? 0;
      case '/film/medium-format':
        return (filmCountByFormat.value['120'] ?? 0) + (filmCountByFormat.value['220'] ?? 0);
      case '/film/large-format-4x5':
        return filmCountByFormat.value['4x5'] ?? 0;
      case '/film/large-format-8x10':
        return filmCountByFormat.value['8x10'] ?? 0;
      default:
        return undefined;
    }
  }

  function navCountDescription(routePath: string, count: number): string {
    if (routePath.startsWith('/devices/')) {
      return `${count} devices`;
    }
    if (routePath.startsWith('/film/')) {
      return `${count} films`;
    }
    if (routePath.startsWith('/emulsions/')) {
      return `${count} emulsions`;
    }
    return `${count} items`;
  }

  function toggleParentExpansion(parentKey: string): void {
    if (expandedKeys.value.includes(parentKey)) {
      expandedKeys.value = expandedKeys.value.filter((key) => key !== parentKey);
      return;
    }

    expandedKeys.value = [...expandedKeys.value, parentKey];
  }

  function handleMenuLabelClick(event: MouseEvent, key: string): void {
    event.stopPropagation();
    const isParent = childRoutesByParent.value.has(key);

    if (isParent) {
      toggleParentExpansion(key);
    }

    isMobileMenuOpen.value = false;
    if (route.path !== key) {
      void router.push(key);
    }
  }

  function toMenuOption(record: (typeof navRoutes.value)[number], includeBadge: boolean): MenuOption {
    const titleText = String(record.meta.title ?? record.name ?? record.path);
    const iconKey = String(record.meta.icon ?? '');
    const icon = navIconByKey[iconKey as keyof typeof navIconByKey];
    const subIcon = subNavIconByPath[record.path as keyof typeof subNavIconByPath];
    const count = includeBadge ? badgeCountForRoute(record.path) : undefined;
    const ariaLabel = typeof count === 'number' ? `${titleText}, ${navCountDescription(record.path, count)}` : titleText;
    const option: MenuOption = {
      key: record.path,
      label: () =>
        h('div', {
          class: 'app-shell__menu-label',
          'aria-label': ariaLabel,
          onClick: (event: MouseEvent) => {
            handleMenuLabelClick(event, record.path);
          }
        }, [
          h('span', { class: 'app-shell__menu-text' }, titleText),
          ...(typeof count === 'number'
            ? [h('span', { class: 'sr-only' }, navCountDescription(record.path, count))]
            : []),
          ...(typeof count === 'number'
            ? [h(NBadge, {
              class: 'app-shell__menu-badge',
              value: count,
              showZero: true,
              offset: [16, 0],
              'aria-hidden': 'true'
            })]
            : [])
        ])
    };

    if (subIcon) {
      option.icon = () => h(NIcon, null, { default: () => h(subIcon) });
    } else if (icon) {
      option.icon = () => h(NIcon, null, { default: () => h(icon) });
    }

    return option;
  }

  const menuOptions = computed<MenuOption[]>(() =>
    parentNavRoutes.value.map((record) => {
      const children = childRoutesByParent.value.get(record.path) ?? [];
      const option = toMenuOption(record, false);

      if (children.length > 0) {
        option.children = children.map((child) => toMenuOption(child, true));
      }

      return option;
    })
  );

  const selectedKey = computed<string | null>(() => {
    const explicitNavKey = route.meta.navKey;
    if (typeof explicitNavKey === 'string') {
      return explicitNavKey;
    }

    const currentPath = route.path;
    const directMatch = navRoutes.value.find((navRoute) => navRoute.path === currentPath);
    if (directMatch) {
      return directMatch.path;
    }

    const prefixMatch = navRoutes.value.find((navRoute) => currentPath.startsWith(`${navRoute.path}/`));
    if (prefixMatch) {
      return prefixMatch.path;
    }

    return lastActiveSection.value;
  });

  const routePathSegments = computed(() => route.path.split('/').filter(Boolean));

  const lastPathSegment = computed(() => {
    const rawSegment = routePathSegments.value.at(-1);
    if (!rawSegment) {
      return 'frollz';
    }

    return decodeURIComponent(rawSegment);
  });

  const selectedRouteRecord = computed(() => {
    if (!selectedKey.value) {
      return null;
    }

    return navRoutes.value.find((record) => record.path === selectedKey.value) ?? null;
  });

  const directMatchedNavRecord = computed(() =>
    navRoutes.value.find((record) => record.path === route.path) ?? null
  );

  const navRouteByPath = computed(() => {
    const byPath = new Map<string, (typeof navRoutes.value)[number]>();
    for (const record of navRoutes.value) {
      byPath.set(record.path, record);
    }
    return byPath;
  });

  const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      {
        key: 'home',
        label: 'frollz',
        to: '/',
        icon: Home,
        ariaLabel: 'frollz home'
      }
    ];

    const currentRecord = selectedRouteRecord.value;
    if (!currentRecord) {
      items.push({
        key: `current-${route.path}`,
        label: lastPathSegment.value,
        isCurrent: true
      });
      return items;
    }

    const isDirectMatch = directMatchedNavRecord.value?.path === currentRecord.path;
    const parentPath = typeof currentRecord.meta.navParent === 'string' ? currentRecord.meta.navParent : null;

    if (parentPath) {
      const parentRecord = navRouteByPath.value.get(parentPath);

      if (parentRecord) {
        items.push({
          key: parentRecord.path,
          label: String(parentRecord.meta.title ?? parentRecord.name ?? parentRecord.path),
          to: parentRecord.path
        });
      }

      if (isDirectMatch) {
        items.push({
          key: currentRecord.path,
          label: String(currentRecord.meta.title ?? currentRecord.name ?? currentRecord.path),
          isCurrent: true
        });
        return items;
      }
    } else if (isDirectMatch) {
      items.push({
        key: currentRecord.path,
        label: String(currentRecord.meta.title ?? currentRecord.name ?? currentRecord.path),
        isCurrent: true
      });
      return items;
    } else {
      items.push({
        key: currentRecord.path,
        label: String(currentRecord.meta.title ?? currentRecord.name ?? currentRecord.path),
        to: currentRecord.path
      });
    }

    items.push({
      key: `current-${route.path}`,
      label: lastPathSegment.value,
      isCurrent: true
    });
    return items;
  });

  function syncViewportState(): void {
    isMobile.value = window.innerWidth < MOBILE_BREAKPOINT;
    if (!isMobile.value) {
      isMobileMenuOpen.value = false;
    }
  }

  function readShellState(): void {
    try {
      isSidebarCollapsed.value = localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1';
      lastActiveSection.value = localStorage.getItem(LAST_ACTIVE_SECTION_KEY);
    } catch {
      isSidebarCollapsed.value = false;
      lastActiveSection.value = null;
    }
  }

  function toggleDesktopSidebar(): void {
    isSidebarCollapsed.value = !isSidebarCollapsed.value;
  }

  function handleMenuSelect(key: string): void {
    isMobileMenuOpen.value = false;
    void router.push(key);
  }

  function handleExpandedKeys(nextKeys: string[]): void {
    expandedKeys.value = nextKeys;
  }

  function ensureParentExpanded(menuKey: string | null): void {
    if (!menuKey) {
      return;
    }

    const routeRecord = navRoutes.value.find((record) => record.path === menuKey);
    if (!routeRecord || typeof routeRecord.meta.navParent !== 'string') {
      return;
    }

    if (!expandedKeys.value.includes(routeRecord.meta.navParent)) {
      expandedKeys.value = [...expandedKeys.value, routeRecord.meta.navParent];
    }
  }

  watch(isSidebarCollapsed, (value) => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value ? '1' : '0');
    } catch {
      // Ignore storage errors in private or constrained environments.
    }
  });

  watch(selectedKey, (value) => {
    if (!value) {
      return;
    }

    ensureParentExpanded(value);
    lastActiveSection.value = value;
    try {
      localStorage.setItem(LAST_ACTIVE_SECTION_KEY, value);
    } catch {
      // Ignore storage errors in private or constrained environments.
    }
  }, { immediate: true });

  onMounted(() => {
    readShellState();
    syncViewportState();
    window.addEventListener('resize', syncViewportState);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', syncViewportState);
  });

  watch(
    () => route.path,
    () => {
      document.title = `${lastPathSegment.value} | frollz`;
    },
    { immediate: true }
  );

  return {
    breadcrumbItems,
    expandedKeys,
    handleExpandedKeys,
    handleMenuSelect,
    isMobile,
    isMobileMenuOpen,
    isSidebarCollapsed,
    lastPathSegment,
    menuOptions,
    selectedKey,
    toggleDesktopSidebar
  };
}
