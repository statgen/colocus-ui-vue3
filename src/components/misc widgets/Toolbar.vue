<template>
    <v-toolbar class="fixed-toolbar bg-clcBackground" flat density="compact" border height="72">
      <v-icon v-if="isFilterButtonVisible" icon="mdi-filter-outline" @click="toggleFilterPanel" class="text-clcAction mx-3" size="40px"/>

      <AppLogo />

      <div class="ml-10">
        <router-link :to="searchPage" class="nav-link text-clcHeading">Search</router-link>
        <router-link to="/studies" class="nav-link text-clcHeading">Studies</router-link>
<!--        <router-link to="/genes" class="nav-link text-clcHeading">Genes</router-link>-->
<!--        <router-link to="/traits" class="nav-link text-clcHeading">Traits</router-link>-->
        <router-link to="/help" class="nav-link text-clcHeading">Help</router-link>
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
const isFilterButtonVisible = computed(() => appStore.filterControls.isFilterButtonShowing)
const searchPage = `/${PAGE_NAMES.SEARCH}`

</script>

<style scoped>
.fixed-toolbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.nav-link {
  margin: 0 15px;
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
