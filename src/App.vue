<template>
  <v-app>
    <Toolbar />
    <v-main>
      <v-row class="mt-10 mb-2">
        <v-col cols="2" v-show="store.isFilterPanelShowing">
          <FilterPanel />
        </v-col>
        <v-col>
          <router-view></router-view>
        </v-col>
      </v-row>
    </v-main>
    <Footer />
  </v-app>
</template>

<script setup>
import { useFilterStore } from '@/stores/FilterStore';
const store = useFilterStore();
</script>
