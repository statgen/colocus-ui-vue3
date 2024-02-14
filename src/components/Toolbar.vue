<template>
    <v-toolbar class="fixed-toolbar" flat density="compact" border>
      <v-icon icon="mdi-filter-outline" class="mx-3" size="40px" @click="toggleFilterPanel" color="red-darken-3" />

      <AppLogo />

      <div class="ml-10">
        <router-link to="search" class="nav-link">Search</router-link>
        <router-link to="about" class="nav-link">About</router-link>
  <!--      <router-link to="/quality" class="nav-link">Quality</router-link>-->
  <!--      <router-link to="/help" class="nav-link">Help</router-link>-->
  <!--      <router-link to="/about" class="nav-link">About</router-link>-->
      </div>

      <v-spacer></v-spacer>

      <AmpLogo />

  </v-toolbar>
</template>

<script setup>
import { useFilterStore } from '@/stores/FilterStore';

const store = useFilterStore();

const toggleFilterPanel = () => {
  store.isFilterPanelShowing = !store.isFilterPanelShowing

}
</script>

<style scoped>
.fixed-toolbar {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  /*height: 60px;*/
}

.nav-link {
  color: blue;
  text-decoration: none;
  margin: 0 15px;
  font-size: 25px;
}

a.router-link-active {
  color: #FFCB05;
}

a:hover {
  /*color: lawngreen;*/
  font-weight: bold;
}

</style>
