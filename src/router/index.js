import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'
import { titleCase } from '@/util/util'

const SHOW_FILTER_PANEL = true

const homePage = PAGE_NAMES.HOME
const genePage = PAGE_NAMES.GENE
const helpPage = PAGE_NAMES.HELP
const locuszoomPage = PAGE_NAMES.LOCUSZOOM
const manhattanPage = PAGE_NAMES.MANHATTAN
const searchPage = PAGE_NAMES.SEARCH
const studyPage = PAGE_NAMES.STUDIES
const traitPage = PAGE_NAMES.TRAITS
const qcStatsPage = PAGE_NAMES.STATS_QC
const summaryStatsPage = PAGE_NAMES.STATS_SUMMARY

const enableFiltering = (panelIsVisible) => {
  const appStore = useAppStore()
  appStore.filterPanelControls.isSidebarButtonShowing = true
  appStore.filterPanelControls.isSidebarShowing = panelIsVisible
}

const disableFiltering = () => {
  const appStore = useAppStore()
  appStore.filterPanelControls.isSidebarButtonShowing = false
  appStore.filterPanelControls.isSidebarShowing = false
}

const routes = [
  {
    path: '/',
    name: homePage,
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: `/${genePage}`,
    name: genePage,
    component: () => import('@/views/GeneView.vue'),
    beforeEnter: (to, from, next) => {
      enableFiltering(SHOW_FILTER_PANEL)
      next()
    },
  },
  {
    path: `/${helpPage}`,
    name: helpPage,
    component: () => import('@/views/HelpView.vue'),
  },
  {
    path: `/${locuszoomPage}`,
    name: locuszoomPage,
    component: () => import('@/views/LocusZoomView.vue'),
    beforeEnter: (to, from, next) => {
      enableFiltering(SHOW_FILTER_PANEL)
      const appStore = useAppStore()
      appStore.copySearchFiltersToNextPage(to.name)
      next()
    }
  },
  {
    // path: `/${manhattanPage}/:analysisID/:trait`,
    path: `/${manhattanPage}/`,
    name: manhattanPage,
    component: () => import('@/views/ManhattanView.vue'),
    beforeEnter: async (to, from, next) => {
      enableFiltering(SHOW_FILTER_PANEL)
      const appStore = useAppStore()
      appStore.copySearchFiltersToNextPage(to.name)
      // appStore.preloadTrait = to.params.trait
      next()
    }
  },
  {
    path: `/${qcStatsPage}`,
    name: qcStatsPage,
    component: () => import('@/views/QCStatsView.vue'),
    beforeEnter: (to, from, next) => {
      next()
    }
  },
  {
    path: `/${searchPage}`,
    name: searchPage,
    component: () => import('@/views/SearchView.vue'),
    beforeEnter: (to, from, next) => {
      const appStore = useAppStore()
      enableFiltering(SHOW_FILTER_PANEL)
      next()
    }
  },
  {
    path: `/${summaryStatsPage}`,
    name: summaryStatsPage,
    component: () => import('@/views/SummaryStatsView.vue'),
    beforeEnter: (to, from, next) => {
      next()
    }
  },
  {
    path: '/ss',
    name: 'ss',
    component: () => import('@/views/StyleSheetView.vue'),
  },
  {
    path: `/${studyPage}`,
    name: studyPage,
    component: () => import('@/views/StudiesView.vue'),
  },
  {
    path: `/${traitPage}`,
    name: traitPage,
    component: () => import('@/views/TraitView.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async(to, from, next) => {
  // console.log('Navigating from', from.fullPath, 'to', to.fullPath)
  const appStore = useAppStore()
  appStore.currentPageName = to.name
  if(![searchPage, locuszoomPage, manhattanPage, genePage].includes(to.name)) disableFiltering()
  if (!appStore.filterPanelControls.isFilterDataLoaded) await appStore.loadFilterData()
  next()
})

router.afterEach(async(to, from, next) => {
  document.title = `Colocus: ${titleCase(to.name)}`
})

export default router
