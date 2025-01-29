<template>
  <v-scroll-x-transition>
    <v-sheet v-show="appStore.filterPanelControls.isFilterPanelShowing" class="ml-n2" >
      <FilterPanelSubpanel title="Select" resetButton="true">
        <CtlAutocomplete :controlSet="controlConfig.study" />
        <CtlAutocomplete :controlSet="controlConfig.gene" />
        <CtlTextfield :controlSet="controlConfig.region" />
        <CtlAutocomplete :controlSet="controlConfig.phenotype" />
        <CtlAutocomplete :controlSet="controlConfig.tissue" />
      </FilterPanelSubpanel>

      <FilterPanelSubpanel title="Set threshold" resetButton="true">
        <CtlTextfield :controlSet="controlConfig.trait1" />
        <CtlTextfield :controlSet="controlConfig.trait2" />
        <CtlTextfield :controlSet="controlConfig.h4" />
        <CtlTextfield :controlSet="controlConfig.r2" />
      </FilterPanelSubpanel>

      <FilterPanelSubpanel title="View">
        <CtlSwitch :controlSet="controlConfig.colorCodeVariants" />
        <CtlSwitch :controlSet="controlConfig.showEnsIDs" />
        <CtlSwitch :controlSet="controlConfig.showEffects" />
      </FilterPanelSubpanel>
    </v-sheet>
  </v-scroll-x-transition>
</template>

<script setup>
import { useAppStore } from '@/stores/AppStore'

const appStore = useAppStore()

const POS_DECIMAL_REGEX = /^\d*\.?\d*$/
const CHR_REGION_REGEX = /^\d\d?:\d+-\d+$/

const rules = {
  posDecRule: v => (!!v && POS_DECIMAL_REGEX.test(v)) || "Must be positive number ≥ 0",
  probabilityRule: v => (!!v && POS_DECIMAL_REGEX.test(v) && v >= 0 && v <= 1) || "Must be positive, 0 ≤ value ≤ 1",
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
  trait1: { title: 'Trait 1 -log<sub>10</sub> p-value ≥', storeKey: 'trait1log10p', items: null, rules: [rules.posDecRule], emptyValue: '0', defaultValue: '0', placeholder: null },
  trait2: { title: 'Trait 2 -log<sub>10</sub> p-value ≥', storeKey: 'trait2log10p', items: null, rules: [rules.posDecRule], emptyValue: '0', defaultValue: '0', placeholder: null },
  h4: { title: 'Colocalization PP(H4) ≥', storeKey: 'h4', items: null, rules: [rules.probabilityRule], emptyValue: '0', defaultValue: '0.5', placeholder: null },
  r2: { title: 'r<sup>2</sup> ≥', storeKey: 'r2', items: null, rules: [rules.probabilityRule], emptyValue: '0', defaultValue: '0.3', placeholder: null },
  colorCodeVariants: { title: 'Color-code variants', storeKey: 'colorCodeVariants', defaultValue: true },
  showEnsIDs: { title: 'Show Ensembl IDs', storeKey: 'showEnsIDs', defaultValue: false },
  showEffects: { title: 'Show effect sizes', storeKey: 'showEffects', defaultValue: false }
}

</script>

<style scoped>
</style>
