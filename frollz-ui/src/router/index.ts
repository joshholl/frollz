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
      component: Dashboard
    },
    {
      path: '/stocks',
      name: 'stocks',
      component: StocksView
    },
    {
      path: '/rolls',
      name: 'rolls',
      component: RollsView
    },
    {
      path: '/rolls/:key',
      name: 'roll-detail',
      component: RollDetailView
    },
    {
      path: '/formats',
      name: 'formats',
      component: FilmFormatsView
    },
    {
      path: '/tags',
      name: 'tags',
      component: TagsView
    }
  ]
})

// Move focus to <main> after each navigation so screen reader users land at the top of new content
router.afterEach(() => {
  nextTick(() => {
    document.getElementById('main-content')?.focus()
  })
})

export default router