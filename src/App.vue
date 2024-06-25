<template>
  <v-app>
    <Toolbar />
    <v-main>
      <v-row class="mt-14 mb-2 ml-2" no-gutters>
        <router-view :key="$route.fullPath"></router-view>
      </v-row>
    </v-main>
    <Footer />
  </v-app>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue';

const handleBeforeUnload = (event) => {
  sessionStorage.setItem('isReload', 'true');
};

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload);
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
})
</script>
