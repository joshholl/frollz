import { defineStore } from 'pinia';
import { ref } from 'vue';
const COOKIE_NAME = 'frollz-theme';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
function getCookie() {
    const match = document.cookie.match(/(?:^|; )frollz-theme=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}
function setCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}
export const useThemeStore = defineStore('theme', () => {
    const cookieValue = getCookie();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = ref(cookieValue !== null ? cookieValue === 'dark' : prefersDark);
    function apply() {
        if (isDark.value) {
            document.documentElement.classList.add('dark');
        }
        else {
            document.documentElement.classList.remove('dark');
        }
    }
    function toggle() {
        isDark.value = !isDark.value;
        setCookie(COOKIE_NAME, isDark.value ? 'dark' : 'light');
        apply();
    }
    apply();
    return { isDark, toggle };
});
