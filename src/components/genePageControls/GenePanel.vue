<template>
  <v-scroll-x-transition>
    <v-sheet v-show="appStore.filterPanelControls.isSidebarShowing" class="nl-n2">
      <FilterPanelSubpanel title="Settings" resetButton="true">
        <CtlGeneSelect :controlSet="controlConfig.geneSelect" />
        <CtlSlider :controlSet="controlConfig.h4" />
        <CtlSlider :controlSet="controlConfig.r2" />

        <CtlSwitch :controlSet="controlConfig.colorCodeVariants" />
        <CtlSwitch :controlSet="controlConfig.showEnsIDs" />
        <CtlSwitch :controlSet="controlConfig.showDatasets" />
      </FilterPanelSubpanel>
    </v-sheet>
  </v-scroll-x-transition>
</template>

<script setup>
import { useAppStore } from '@/stores/AppStore'
import { THRESHOLDS } from '@/constants'

const appStore = useAppStore()

const controlConfig = {
  geneSelect: { title: 'QTL Gene', storeKey: 'selectedGene', defaultValue: '', },
  h4: { title: 'h4 ≥', storeKey: 'h4', defaultValue: THRESHOLDS.H4, enableKey: 'slidersEnabled'},
  r2: { title: 'r2 ≥', storeKey: 'r2', defaultValue: THRESHOLDS.R2, enableKey: 'slidersEnabled'},
  colorCodeVariants: { title: 'Color-code variants', storeKey: 'colorCodeVariants', defaultValue: true, },
  showDatasets: { title: 'Show datasets', storeKey: 'showDatasets', defaultValue: false, },
  showEnsIDs: { title: 'Show Ensembl IDs', storeKey: 'showEnsIDs', defaultValue: false, },
}
</script>

<style scoped>
</style>
