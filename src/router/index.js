import { createRouter, createWebHistory } from 'vue-router'
import { useFilterStore } from '@/stores/FilterStore'
import { PAGE_NAMES } from '@/constants'

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
    name: PAGE_NAMES.HOME,
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: `/${PAGE_NAMES.GENES}`,
    name: PAGE_NAMES.GENES,
    component: () => import('@/views/GenesView.vue'),
  },
  {
    path: `/${PAGE_NAMES.HELP}`,
    name: PAGE_NAMES.HELP,
    component: () => import('@/views/HelpView.vue'),
  },
  {
    path: `/${PAGE_NAMES.LOCUSZOOM}`,
    name: PAGE_NAMES.LOCUSZOOM,
    component: () => import('@/views/LocusZoomView.vue'),
    beforeEnter: (to, from, next) => {
      enableFiltering(SHOW_FILTER_PANEL)
      const filterStore = useFilterStore()
      filterStore.copySearchFiltersToNextPage(to.name)
      next()
    }
  },
  {
    // path: `/${PAGE_NAMES.MANHATTAN}/:analysisID/:trait`,
    path: `/${PAGE_NAMES.MANHATTAN}/:analysisID`,
    name: PAGE_NAMES.MANHATTAN,
    component: () => import('@/views/ManhattanView.vue'),
    beforeEnter: async (to, from, next) => {
      enableFiltering(SHOW_FILTER_PANEL)
      const filterStore = useFilterStore()
      filterStore.copySearchFiltersToNextPage(to.name)
      // filterStore.preloadTrait = to.params.trait
      next()
    }
  },
  {
    path: `/${PAGE_NAMES.SEARCH}`,
    name: PAGE_NAMES.SEARCH,
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
    path: `/${PAGE_NAMES.STUDIES}`,
    name: PAGE_NAMES.STUDIES,
    component: () => import('@/views/StudiesView.vue'),
  },
  {
    path: `/${PAGE_NAMES.TRAITS}`,
    name: PAGE_NAMES.TRAITS,
    component: () => import('@/views/TraitView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async(to, from, next) => {
  const filterStore = useFilterStore()
  filterStore.currentPageName = to.name
  if(![PAGE_NAMES.SEARCH, PAGE_NAMES.LOCUSZOOM, PAGE_NAMES.MANHATTAN].includes(to.name)) disableFiltering()
  if (!filterStore.isFilterDataLoaded) await filterStore.loadFilterData()

  const isReload = sessionStorage.getItem('isReload');
  // console.log(`isReload: ${isReload}, to.name: ${to.name}`); // Debug log

  if (isReload) { // && to.name === PAGE_NAMES.LOCUSZOOM) {
    sessionStorage.removeItem('isReload');
    return next({ name: PAGE_NAMES.SEARCH });
  } else {
    next();
  }
})

export default router
