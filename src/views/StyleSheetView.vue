<template>
  <v-col class="ml-2">
    <v-row class="d-block mt-2">
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <p class="text-clcAction">
        <v-icon icon="mdi-filter-outline" class="mx-3 text-clcAction" size="40px"/>
        Action color
      </p>

    </v-row>
    <v-row>
      <div class="bg-clcBackground div-size">Background color</div>
      <div class="bg-clcAction div-size">Action color</div>
      <div class="bg-clcBackground div-size"><v-icon icon="mdi-filter-outline" class="mx-3 text-clcAction" size="40px"/></div>
    </v-row>
    <v-row>
      <div class="div-size1">
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>
    </v-row>
    <v-row>
      <div class="bg-clcBackground div-size1">
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>
    </v-row>
    <v-row class="d-block ml-2">
      <div style="height: 50px" />
      <h1 class="custom-class">hi there</h1>
      <div class="bg-something on-something">background color with appropriate text color contrast</div>
      <div class="bg-something on-clcAction">background color with appropriate text color contrast</div>
      <div class="text-something">text color</div>
      <div class="border-something">border color</div>
    </v-row>
  </v-col>
</template>

<style scoped>
.div-size {
  height: 150px;
  width: 150px;
  margin: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid black;
}
.div-size1 {
  padding: 4px;
  width: 800px;
  margin: 10px;
  border: 1px solid black;
}
.custom-class {
  background: rgba(var(--v-theme-something), 0.2);
  color: rgba(var(--v-theme-on-something), 0.5);
}
</style>
