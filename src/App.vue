<template>
  <v-app>
    <Toolbar />
    <v-main>
      <v-row class="mt-14 mb-2 ml-2" no-gutters>
        <router-view></router-view>
      </v-row>
    </v-main>
    <Footer />
  </v-app>
</template>

<script setup>
</script>
