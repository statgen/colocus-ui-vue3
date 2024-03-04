<template>
    <v-toolbar class="fixed-toolbar" flat density="compact" border>
      <v-icon v-if="isFilterButtonVisible" icon="mdi-filter-outline" @click="toggleFilterPanel" class="mx-3 text-teal-accent-4" size="40px"/>

      <AppLogo />

      <div class="ml-10">
        <router-link to="/search" class="nav-link text-teal-accent-4">Search</router-link>
        <router-link to="/studies" class="nav-link text-teal-accent-4">Studies</router-link>
        <router-link to="/genes" class="nav-link text-teal-accent-4">Genes</router-link>
        <router-link to="/traits" class="nav-link text-teal-accent-4">Traits</router-link>
        <router-link to="/help" class="nav-link text-teal-accent-4">Help</router-link>
      </div>

      <v-spacer></v-spacer>

      <a href="https://forms.gle/9idPsYcUcKDBqS8s6" target="_blank" rel="noopener noreferrer">
        <v-btn size="small" variant="tonal" color="teal-accent-4" class="btn mx-2">Feedback</v-btn>
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
  text-decoration: none;
  margin: 0 15px;
  font-size: 1.75rem;
}

a.router-link-active {
  /*font-weight: bold;*/
  border-bottom: 2px solid ;
}

a:hover {
  font-weight: bold;
}

</style>
