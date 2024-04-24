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
    path: `/${PAGE_NAMES.MANHATTAN}/:analysisID`,
    name: PAGE_NAMES.MANHATTAN,
    component: () => import('@/views/ManhattanView.vue'),
    beforeEnter: async (to, from, next) => {
      enableFiltering(SHOW_FILTER_PANEL)
      const filterStore = useFilterStore()
      filterStore.copySearchFiltersToNextPage(to.name)
      const analysisID = to.params.analysisID
      console.log('route aid:', analysisID)
      await filterStore.loadManhattanData(analysisID)
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

router.beforeEach(async(to, from) => {
  const filterStore = useFilterStore()
  filterStore.currentPageName = to.name
  disableFiltering()
  if (!filterStore.isFilterDataLoaded) await filterStore.loadFilterData()
})

export default router
