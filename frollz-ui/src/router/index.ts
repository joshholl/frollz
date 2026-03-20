import { createRouter, createWebHistory } from 'vue-router'
import { nextTick } from 'vue'
import Dashboard from '@/views/Dashboard.vue'
import StocksView from '@/views/StocksView.vue'
import RollsView from '@/views/RollsView.vue'
import RollDetailView from '@/views/RollDetailView.vue'
import FilmFormatsView from '@/views/FilmFormatsView.vue'
import TagsView from '@/views/TagsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      meta: { title: 'Dashboard' }
    },
    {
      path: '/stocks',
      name: 'stocks',
      component: StocksView,
      meta: { title: 'Stocks' }
    },
    {
      path: '/rolls',
      name: 'rolls',
      component: RollsView,
      meta: { title: 'Rolls' }
    },
    {
      path: '/rolls/:key',
      name: 'roll-detail',
      component: RollDetailView
    },
    {
      path: '/formats',
      name: 'formats',
      component: FilmFormatsView,
      meta: { title: 'Film Formats' }
    },
    {
      path: '/tags',
      name: 'tags',
      component: TagsView,
      meta: { title: 'Tags' }
    }
  ]
})

// Update page title and move focus to <main> after each navigation (WCAG 2.4.2 Page Titled)
router.afterEach((to) => {
  nextTick(() => {
    const metaTitle = typeof to.meta.title === 'string' ? to.meta.title : ''
    const rollKey = to.name === 'roll-detail' && to.params.key ? String(to.params.key) : ''
    const pageTitle = rollKey ? `Roll ${rollKey}` : metaTitle
    document.title = pageTitle ? `${pageTitle} | Frollz` : 'Frollz'
    document.getElementById('main-content')?.focus()
  })
})

export default router