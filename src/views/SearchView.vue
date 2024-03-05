<template>
  <PageWrapper>
    <v-col cols="2" v-show="filterStore.isFilterPanelShowing">
      <FilterPanel />
    </v-col>
    <v-col>
      <h1>Search</h1>
      <h2>
        <router-link to="/locuszoom" class="nav-link text-teal-accent-4">LocusZoom</router-link>
      </h2>
    </v-col>
  </PageWrapper>
</template>

<script setup>
import { onMounted, provide, ref, watch } from 'vue';
import { useFilterStore } from '@/stores/FilterStore';

const filterStore = useFilterStore();

const loadFPControls = ref(false)

provide('loadFPControls', loadFPControls)

onMounted(() => {
  loadFPControls.value = !loadFPControls.value
});

</script>

<style scoped>
</style>
