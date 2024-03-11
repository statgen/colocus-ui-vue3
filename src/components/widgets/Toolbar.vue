<template>
    <v-toolbar class="fixed-toolbar" flat density="compact" border color="clcBackground">
      <v-icon v-if="isFilterButtonVisible" icon="mdi-filter-outline" @click="toggleFilterPanel" color="clcAction" class="mx-3" size="40px"/>

      <AppLogo />

      <div class="ml-10">
        <router-link to="/search" class="nav-link text-clcAction text-decoration-none">Search</router-link>
        <router-link to="/studies" class="nav-link  text-clcAction text-decoration-none">Studies</router-link>
        <router-link to="/genes" class="nav-link  text-clcAction text-decoration-none">Genes</router-link>
        <router-link to="/traits" class="nav-link  text-clcAction text-decoration-none">Traits</router-link>
        <router-link to="/help" class="nav-link  text-clcAction text-decoration-none">Help</router-link>
      </div>

      <v-spacer></v-spacer>

      <a href="https://forms.gle/9idPsYcUcKDBqS8s6" target="_blank" rel="noopener noreferrer">
        <v-btn size="small" variant="tonal" color="clcAction" class="mx-2">Feedback</v-btn>
      </a>

      <AmpLogo class="mr-2"/>

  </v-toolbar>
</template>

<script setup>
import { computed } from 'vue'
import { useFilterStore } from '@/stores/FilterStore'

const filterStore = useFilterStore();
const { toggleFilterPanel } = filterStore
const isFilterButtonVisible = computed(() => filterStore.isFilterButtonShowing)

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
}

a.router-link-active {
  border-bottom: 2px solid ;
}

a:hover {
  font-weight: bold;
}

</style>
