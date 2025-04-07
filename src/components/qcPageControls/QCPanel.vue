<template>
  <v-scroll-x-transition>
    <v-sheet v-show=true class="nl-n2">
      <FilterPanelSubpanel title="Settings" resetButton="true">
        <QCSelector :controlSet="controlSet.study" @resetSliders="resetSliders"/>
        <QCSlider :controlSet="controlSet.h4" />
        <QCSlider :controlSet="controlSet.r2" />
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
        </FilterPanelSubpanel>
    </v-sheet>
  </v-scroll-x-transition>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { THRESHOLDS } from '@/constants'
import { scrollToHeading, truncateString } from '@/util/util'

const MAX_PLOT_TITLE_LEN = 40

const plotHeadings = ref([])

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
