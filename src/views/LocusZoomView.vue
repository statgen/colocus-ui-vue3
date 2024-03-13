<template>
    <v-col v-show="filterStore.isFilterPanelShowing" class="filter-panel-container">
      <FilterPanel />
    </v-col>
  <v-col :cols="filterStore.isFilterPanelShowing ? 10 : 12" class="ml-2">
      <h1>
        <v-icon icon="mdi-arrow-left-circle" @click="router.back()" color="clcAction" class="mx-0 mb-2" size="24px"/>
        Locus Zoom
      </h1>
    </v-col>
</template>

<script setup>
import { onMounted, provide, ref, watch } from 'vue';
import router from '@/router'
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
</style>
