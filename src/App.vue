<template>
  <v-app>
    <Toolbar />
    <v-main>
      <router-view></router-view>
    </v-main>
    <Footer />
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import { useFilterStore } from '@/stores/FilterStore';

const filterStore = useFilterStore()

// onMounted(async () => {
//   try {
//     await filterStore.loadFilterData();
//   } catch (error) {
//     throw new Error("Failed to load filter data:");
//   }
// })

</script>
