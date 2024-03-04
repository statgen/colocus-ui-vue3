import { createRouter, createWebHistory } from 'vue-router'

import { useFilterStore } from '@/stores/FilterStore'

const loadFilterData = async ()  => {
  const filterStore = useFilterStore()
  if(!filterStore.isFilterDataLoaded) {
    await filterStore.loadFilterData();
  }
}

const enableFiltering = (page) => {
  const filterStore = useFilterStore()
  filterStore.isFilterButtonShowing = true
  filterStore.isFilterPanelShowing = true
}

const disableFilterButton = () => {
  const filterStore = useFilterStore()
  filterStore.isFilterButtonShowing = false
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    beforeEnter: (to, from, next) => {
      disableFilterButton()
      next()
    }
  },
  {
    path: '/genes',
    name: 'genes',
    component: () => import('@/views/GenesView.vue'),
    beforeEnter: (to, from, next) => {
      disableFilterButton()
      next()
    }
  },
  {
    path: '/help',
    name: 'help',
    component: () => import('@/views/HelpView.vue'),
    beforeEnter: (to, from, next) => {
      disableFilterButton()
      next()
    }
  },
  {
    path: '/locuszoom',
    name: 'locuszoom',
    component: () => import('@/views/LocusZoomView.vue'),
    beforeEnter: (to, from, next) => {
      enableFiltering('locusZoomPageData')
      const filterStore = useFilterStore()
      filterStore.copySearchFiltersToLZ()
      next()
    }
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchView.vue'),
    beforeEnter: (to, from, next) => {
      enableFiltering('searchPageData')
      next()
    }
  },
  {
    path: '/studies',
    name: 'studies',
    component: () => import('@/views/StudiesView.vue'),
    beforeEnter: (to, from, next) => {
      disableFilterButton()
      next()
    }
  },
  {
    path: '/traits',
    name: 'traits',
    component: () => import('@/views/TraitView.vue'),
    beforeEnter: (to, from, next) => {
      disableFilterButton()
      next()
    }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async(to, from) => {
  await loadFilterData()
})

export default router
