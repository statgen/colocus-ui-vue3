<template>
  <v-container id="qcPanel" class="mt-5">
    <v-row>
      <v-col><QCSlider :controlSet="controlSet.h4" /></v-col>
      <v-col><QCSlider :controlSet="controlSet.r2" /></v-col>
      <v-col><QCSelector :controlSet="controlSet.study"/></v-col>
    </v-row>
  </v-container>

</template>

<script setup>

const controlSet = {
  "h4": { caption: "Set h4 threshold ≥", dataKey: "h4Threshold", defaultValue: 0.5, width: 200 },
  "r2": { caption: "Set r2 threshold ≥", dataKey: "r2Threshold", defaultValue: 0.3, width: 200 },
  "study": { caption: "Select omics study", dataKey: "selectedStudy", width: 200, },
}

</script>

<style scoped>
#qcPanel {
  border: 1px solid #ddd;
  height: 90px;
}
</style>
