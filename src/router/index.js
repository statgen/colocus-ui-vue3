import { createRouter, createWebHistory } from 'vue-router'

import { useFilterStore } from '@/stores/FilterStore'

const SHOW_FILTER_PANEL = true

const enableFiltering = (panelIsVisible) => {
  const filterStore = useFilterStore()
  filterStore.isFilterButtonShowing = true
  filterStore.isFilterPanelShowing = panelIsVisible
}

const disableFiltering = () => {
  const filterStore = useFilterStore()
  filterStore.isFilterButtonShowing = false
  filterStore.isFilterPanelShowing = false
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/genes',
    name: 'genes',
    component: () => import('@/views/GenesView.vue'),
  },
  {
    path: '/help',
    name: 'help',
    component: () => import('@/views/HelpView.vue'),
  },
  {
    path: '/locuszoom',
    name: 'locuszoom',
    component: () => import('@/views/LocusZoomView.vue'),
    beforeEnter: (to, from, next) => {
      enableFiltering(SHOW_FILTER_PANEL)
      const filterStore = useFilterStore()
      filterStore.copySearchFiltersToLZ()
      next()
    }
  },
  {
    path: '/manhattan/:analysis_id',
    name: 'manhattan',
    component: () => import('@/views/ManhattanView.vue'),
    beforeEnter: (to, from, next) => {
      enableFiltering(!SHOW_FILTER_PANEL)
      next()
    }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    beforeEnter: (to, from, next) => {
      enableFiltering(SHOW_FILTER_PANEL)
      next()
    }
  },
  {
    path: '/ss',
    name: 'ss',
    component: () => import('@/views/StyleSheetView.vue'),
  },
  {
    path: '/studies',
    name: 'studies',
    component: () => import('@/views/StudiesView.vue'),
  },
  {
    path: '/traits',
    name: 'traits',
    component: () => import('@/views/TraitView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async(to, from) => {
  const filterStore = useFilterStore()
  filterStore.currentPageName = to.name
  disableFiltering()
  if (!filterStore.isFilterDataLoaded) await filterStore.loadFilterData()
})

export default router
