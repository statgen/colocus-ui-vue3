<template>
    <v-toolbar class="fixed-toolbar bg-clcBackground" flat density="compact" border height="72">
      <v-icon v-if="isFilterButtonVisible" icon="mdi-filter-outline" @click="toggleFilterPanel" class="text-clcAction mx-3" size="40px"/>

      <AppLogo />

      <div class="ml-10">
        <router-link :to="searchPage" class="nav-link text-clcHeading">Search</router-link>
        <!-- <router-link to="/genes" class="nav-link text-clcHeading">Genes</router-link> -->

        <v-menu offset-y>
          <template v-slot:activator="{ props }">
         <span
           class="nav-link text-clcHeading"
           style="cursor: pointer;"
           v-bind="props"
         >
            Statistics
            <v-icon x-small class="ml-n4">mdi-chevron-down</v-icon>
          </span>          </template>
          <v-list>
            <v-list-item
              active-color="black"
              base-color="clcAction"
              component="router-link"
              nav
              ripple
              :to="qcStatsPage"
            >QC Statistics</v-list-item>
            <v-list-item
              active-color="black"
              base-color="clcAction"
              component="router-link"
              nav
              ripple
              :to="summaryStatsPage"
            >Summary statistics</v-list-item>
          </v-list>
        </v-menu>

        <router-link :to="studiesPage" class="nav-link text-clcHeading">Studies</router-link>
        <!--        <router-link to="/traits" class="nav-link text-clcHeading">Traits</router-link>-->
        <router-link :to="helpPage" class="nav-link text-clcHeading">Help</router-link>

      </div>

      <v-spacer></v-spacer>

      <a href="https://forms.gle/9idPsYcUcKDBqS8s6" target="_blank" rel="noopener noreferrer">
        <v-btn size="small" variant="tonal" class="text-clcAction mx-2">Feedback</v-btn>
      </a>

      <AmpLogo class="mr-2"/>

  </v-toolbar>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'

const appStore = useAppStore()
const { toggleFilterPanel } = appStore
const isFilterButtonVisible = computed(() => appStore.filterPanelControls.isFilterButtonShowing)

const helpPage = `/${PAGE_NAMES.HELP}`
const qcStatsPage = `/${PAGE_NAMES.STATS_QC}`
const searchPage = `/${PAGE_NAMES.SEARCH}`
const studiesPage = `/${PAGE_NAMES.STUDIES}`
const summaryStatsPage = `/${PAGE_NAMES.STATS_SUMMARY}`

</script>

<style scoped>
.fixed-toolbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.nav-link {
  margin: 0 10px;
  font-size: 1.75rem;
  text-decoration: none;
}

a.router-link-active {
  border-bottom: 2px solid;
}

a:hover {
  font-weight: bold;
}

</style>
