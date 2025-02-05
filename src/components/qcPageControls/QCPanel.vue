<template>
  <v-sheet class="position-fixed bg-clcBackground px-2 mt-2" elevation="0" border :width="panelWidth">
      <ToolTippy>
        <v-icon icon="mdi-minus-circle-outline" @click="onResetButtonClick" class="icon-class" />

        <template #tooltipContent>
          Reset to default values
        </template>
      </ToolTippy>

      <h2 class="mb-2 d-inline-flex">Settings</h2>

      <v-row><QCSelector :controlSet="controlSet.study" @resetSliders="resetSliders"/></v-row>
      <v-row><QCSlider :controlSet="controlSet.h4" /></v-row>
      <v-row><QCSlider :controlSet="controlSet.r2" /></v-row>

  </v-sheet>
</template>

<script setup>
import { provide, ref } from 'vue'
import { THRESHOLDS } from '@/constants'

const controlWidth = 250
const panelWidth = controlWidth + 40

const resetSelect = ref(false)
const resetSlider = ref(false)

provide('resetSelect', resetSelect)
provide('resetSlider', resetSlider)

const onResetButtonClick = () => {
  resetSelect.value = !resetSelect.value
  resetSlider.value = !resetSlider.value
}

const resetSliders = () => {
  resetSlider.value = !resetSlider.value
}

const controlSet = {
  "h4": { caption: "Set h4 threshold ≥", dataKey: "h4Threshold", defaultValue: THRESHOLDS.H4, width: controlWidth },
  "r2": { caption: "Set r² threshold ≥", dataKey: "r2Threshold", defaultValue: THRESHOLDS.R2, width: controlWidth },
  "study": { caption: "Select omics study", dataKey: "selectedStudy", width: controlWidth },
}

</script>

<style scoped>
.icon-class {
  font-size: 20px;
  margin-top: -10px;
  margin-right: 4px;
  color: rgba(var(--v-theme-clcAction), 1.0);
}
</style>
