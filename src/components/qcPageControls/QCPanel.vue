<template>
  <v-sheet class="ml-n2">
    <FilterPanelSubpanel title="Settings" resetButton class="pb-4">
      <QCSelector :controlSet="controlSet.study" @resetSliders="resetSliders"/>
      <CtlSlider :controlSet="controlSet.h4"/>
      <CtlSlider :controlSet="controlSet.r2"/>
      <slot name="anchors"/>
    </FilterPanelSubpanel>
  </v-sheet>
</template>

<script setup>
import { THRESHOLDS } from '@/constants'

const controlSet = {
  "h4": { title: "Set h4 threshold ≥", topKey: 'qcStats', storeKey: "h4Threshold", defaultValue: THRESHOLDS.H4, },
  "r2": { title: "Set r² threshold ≥", topKey: 'qcStats', storeKey: "r2Threshold", defaultValue: THRESHOLDS.R2, },
  "study": { title: "Select omics study", storeKey: "selectedStudy", },
}

</script>

<style scoped>
</style>
