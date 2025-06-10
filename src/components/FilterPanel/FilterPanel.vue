<template>
  <v-sheet v-show="appStore.isSidebarShowing" class="ml-n2" >
    <FilterPanelSubpanel title="Select" resetButton="true" id="subPanelSelect">
      <CtlAutocomplete :controlSet="controlConfig.study" />
      <CtlAutocomplete :controlSet="controlConfig.gene" />
      <CtlTextfield :controlSet="controlConfig.region" />
      <CtlAutocomplete :controlSet="controlConfig.phenotype" />
      <CtlAutocomplete :controlSet="controlConfig.tissue" />
      <CtlAutocomplete :controlSet="controlConfig.cell_type" />
    </FilterPanelSubpanel>

    <FilterPanelSubpanel title="Set threshold" resetButton="true" id="subPanelThreshold">
      <CtlTextfield :controlSet="controlConfig.trait1" />
      <CtlTextfield :controlSet="controlConfig.trait2" />
      <CtlSlider :controlSet="controlConfig.h4" />
      <CtlSlider :controlSet="controlConfig.r2" />
    </FilterPanelSubpanel>

    <FilterPanelSubpanel title="View" id="subPanelView">
      <CtlSwitch :controlSet="controlConfig.colorCodeVariants" />
      <CtlSwitch :controlSet="controlConfig.showEnsIDs" />
      <CtlSwitch :controlSet="controlConfig.showEffects" />
    </FilterPanelSubpanel>
  </v-sheet>
</template>

<script setup>
import { useAppStore } from '@/stores/AppStore'
import { THRESHOLDS } from '@/constants'
import FilterPanelSubpanel from "@/components/FilterPanel/FilterPanelSubpanel.vue";

const appStore = useAppStore()

const POS_DECIMAL_REGEX = /^\d*\.?\d*$/
const CHR_REGION_REGEX = /^\d\d?:\d+-\d+$/

const rules = {
  posDecRule: v => (!!v && POS_DECIMAL_REGEX.test(v)) || "Must be positive number ≥ 0",
  chrRegionRule: v => !v || (!!v && CHR_REGION_REGEX.test(v)) || 'Must match chromosome:start-end, all integers',
}

/**
 * controlConfig stores static config data passed down to controls:
 *   title is the label over the control
 *   storeKey is the key in the appStore where user selections are stored
 *   rules are validators (only for numeric inputs)
 *   emptyValue is inserted into the control if the user deletes everything and moves out of the control (for numeric fields)
 *   defaultValue is used when initially setting up a component or if the user clicks the reset button
 *   placeholder is displayed inside the control until the user types something
 *   the switches only need the title and storeKey keys
 * Dynamic data loaded via API is handled in the controls themselves.
 */
const controlConfig = {
  study: { title: 'Study', storeKey: 'studies', rules: null, emptyValue: null, defaultValue: null, placeholder: 'Select study(ies)' },
  gene: { title: 'QTL gene', storeKey: 'genes', rules: null, emptyValue: null, defaultValue: null, placeholder: 'Select gene(s)' },
  region: { title: 'Genomic Region', storeKey: 'region', items: null, rules: [rules.chrRegionRule], emptyValue: null, defaultValue: '', placeholder: 'chr:start-end' },
  phenotype: { title: 'GWAS Phenotype', storeKey: 'phenotypes', rules: null, emptyValue: null, defaultValue: null, placeholder: 'Select phenotype(s)' },
  tissue: { title: 'QTL Tissue', storeKey: 'tissues', rules: null, emptyValue: null, defaultValue: null, placeholder: 'Select tissue(s)'},
  cell_type: { title: 'QTL Cell Type', storeKey: 'cell_types', rules: null, emptyValue: null, defaultValue: null, placeholder: 'Select cell type(s)'},
  trait1: { title: 'Trait 1 -log<sub>10</sub> p-value ≥', storeKey: 'trait1log10p', items: null, rules: [rules.posDecRule], emptyValue: '0', defaultValue: '0', placeholder: null },
  trait2: { title: 'Trait 2 -log<sub>10</sub> p-value ≥', storeKey: 'trait2log10p', items: null, rules: [rules.posDecRule], emptyValue: '0', defaultValue: '0', placeholder: null },
  h4: { title: 'Colocalization PP(H4) ≥', topKey: 'filter', storeKey: 'h4', items: null, emptyValue: '0', defaultValue: THRESHOLDS.H4, placeholder: null },
  r2: { title: 'r² ≥', topKey: 'filter', storeKey: 'r2', items: null, emptyValue: '0', defaultValue: THRESHOLDS.R2, placeholder: null },
  colorCodeVariants: { title: 'Color-code variants', storeKey: 'colorCodeVariants', defaultValue: true },
  showEnsIDs: { title: 'Show Ensembl IDs', storeKey: 'showEnsIDs', defaultValue: false },
  showEffects: { title: 'Show effect sizes', storeKey: 'showEffects', defaultValue: false }
}

</script>

<style scoped>
</style>
