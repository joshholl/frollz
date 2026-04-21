import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

const routes = [
  { path: '/', redirect: '/film' },
  {
    path: '/login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    component: () => import('../pages/RegisterPage.vue'),
    meta: { public: true }
  },
  { path: '/film', component: () => import('../pages/FilmPage.vue') },
  { path: '/film/:id', component: () => import('../pages/FilmDetailPage.vue') },
  { path: '/receivers', component: () => import('../pages/ReceiversPage.vue') },
  { path: '/emulsions', component: () => import('../pages/EmulsionsPage.vue') }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.isSessionInitialized) {
    await authStore.restoreSession();
  }

  if (!to.meta.public && !authStore.isAuthenticated) {
    return '/login';
  }

  if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    return '/film';
  }

  return true;
});
