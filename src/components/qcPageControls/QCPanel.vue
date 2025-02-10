<template>
  <v-sheet class="position-fixed bg-clcBackground px-2 mt-2 pb-4" elevation="0" border >
    <ToolTippy>
      <v-icon icon="mdi-minus-circle-outline" @click="onResetButtonClick" class="reset-icon-class" />

      <template #tooltipContent>
        Reset to default values
      </template>
    </ToolTippy>

    <h2 class="mb-2 d-inline-flex">Settings</h2>

    <v-row><QCSelector :controlSet="controlSet.study" @resetSliders="resetSliders"/></v-row>
    <v-row><QCSlider :controlSet="controlSet.h4" /></v-row>
    <v-row><QCSlider :controlSet="controlSet.r2" /></v-row>

    <v-row>
      <h2 class="ml-4">Plots</h2>
    </v-row>
    <v-row>
      <ul>
        <li v-for="link in plotHeadings" :key=link.id>
          <ToolTippy>
            <a :href="'#' + link.id" @click.prevent=scrollToHeading(link.id) class="coLink">
              {{ truncateString(link.textContent, MAX_PLOT_TITLE_LEN) }}
            </a>
            <template #tooltipContent>
              {{ link.textContent}}
            </template>
          </ToolTippy>
        </li>
      </ul>
    </v-row>
  </v-sheet>
</template>

<script setup>
import { nextTick, onMounted, provide, ref, toRaw } from 'vue'
import { STATS_PAGE_TOP, THRESHOLDS } from '@/constants'
import { scrollToHeading, truncateString } from '@/util/util'

const MAX_PLOT_TITLE_LEN = 40

const plotHeadings = ref([])

const resetSelect = ref(false)
const resetSlider = ref(false)

provide('resetSelect', resetSelect)
provide('resetSlider', resetSlider)

const onResetButtonClick = () => {
  resetSelect.value = !resetSelect.value
  resetSlider.value = !resetSlider.value
  scrollToHeading(STATS_PAGE_TOP)
}

const resetSliders = () => {
  resetSlider.value = !resetSlider.value
}

onMounted(async () => {
  await nextTick()
  plotHeadings.value = document.querySelectorAll('.gatherMe')
})

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
