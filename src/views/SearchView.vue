<template>
  <PageWrapper>
    <v-col cols="2" v-show="filterStore.isFilterPanelShowing">
      <FilterPanel />
    </v-col>
    <v-col class="ml-2">
      <h1>Search</h1>
      <router-link to="/locuszoom" class="nav-link text-teal-accent-4">LocusZoom</router-link>
    </v-col>
  </PageWrapper>
</template>

<script setup>
import { onMounted, provide, ref, watch } from 'vue';
import { useFilterStore } from '@/stores/FilterStore';

// although not (currently) needed, the filterStore ref here is necessary to ensure that Pinia is
// fully ready before trying to load the data into the filter controls via the onMounted hook
const filterStore = useFilterStore();

const loadFPControls = ref(false)

provide('loadFPControls', loadFPControls)

onMounted(() => {
  loadFPControls.value = !loadFPControls.value
});

</script>

<style scoped>
</style>
