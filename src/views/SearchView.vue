<template>
    <v-col v-show="filterStore.isFilterPanelShowing" class="filter-panel-container">
      <FilterPanel />
    </v-col>
    <v-col :cols="filterStore.isFilterPanelShowing ? 10 : 12" class="ml-2">
      <div class="search-header">
        <h1>Search</h1>
        <h2>
          <router-link to="/locuszoom" class="text-clcAction text-decoration-none">LocusZoom</router-link>
        </h2>
      </div>
      <div class="table-container">
        <DataTable />
      </div>
    </v-col>
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
.filter-panel-container {
  max-width: 275px;
}

.table-container {
  overflow-x: auto;
  max-width: 99%;
}
</style>
