<template>
  <v-sheet class="mt-3">
    <FilterPanelSubpanel title="Settings" resetButton="true" class="pb-4">
      <div class="ml-n2">
        <QCSelector :controlSet="controlSet.study" @resetSliders="resetSliders"/>
        <QCSlider :controlSet="controlSet.h4" />
        <QCSlider :controlSet="controlSet.r2" />
        <slot name="anchors"/>
      </div>
    </FilterPanelSubpanel>
  </v-sheet>
</template>

<script setup>
import { THRESHOLDS } from '@/constants'

const controlSet = {
  "h4": { caption: "Set h4 threshold ≥", dataKey: "h4Threshold", defaultValue: THRESHOLDS.H4, },
  "r2": { caption: "Set r² threshold ≥", dataKey: "r2Threshold", defaultValue: THRESHOLDS.R2, },
  "study": { caption: "Select omics study", dataKey: "selectedStudy", },
}

</script>

<style scoped>
a:hover {
  font-weight: bold;
}

ul {
  margin-left: 1rem;
  list-style: none;
}

</style>
