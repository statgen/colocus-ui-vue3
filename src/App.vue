<template>
  <v-app class="app-shell">
    <Toolbar />
    <div class="app-content">
      <router-view :key="$route.name" class="ml-2 mt-14"/>
    </div>
    <Footer />
  </v-app>
</template>

<script setup>
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-content {
  flex: 1 0 auto;
  overflow: hidden; /* or scroll if needed */
}
</style>
