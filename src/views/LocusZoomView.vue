<template>
  <PageWrapper>
    <v-col cols="2" v-show="filterStore.isFilterPanelShowing">
      <FilterPanel />
    </v-col>
    <v-col class="ml-2">
      <h1>
        <v-icon icon="mdi-arrow-left-circle" @click="router.back()" class="mx-0 mb-2 text-teal-accent-4" size="28px"/>
        Locus Zoom
      </h1>
    </v-col>
  </PageWrapper>
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
</style>
