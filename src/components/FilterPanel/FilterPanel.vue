<template>
  <v-sheet v-show="appStore.isSidebarShowing" class="ml-n2" >
    <FilterPanelSubpanel title="Select" resetButton id="subPanelSelect">
      <CtlAutocomplete :controlSet="controlConfig.study" />
      <CtlAutocomplete :controlSet="controlConfig.analysisTypes" />
      <CtlAutocomplete :controlSet="controlConfig.analysisTypePriority" />
      <CtlAutocomplete :controlSet="controlConfig.gene" />
      <CtlTextfield :controlSet="controlConfig.region" />
      <CtlAutocomplete :controlSet="controlConfig.phenotype" />
      <CtlAutocomplete :controlSet="controlConfig.tissue" />
      <div v-if="appStore.showCellType">
        <CtlAutocomplete :controlSet="controlConfig.cell_type" />
      </div>
    </FilterPanelSubpanel>

    <FilterPanelSubpanel title="Set threshold" resetButton id="subPanelThreshold">
      <CtlTextfield :controlSet="controlConfig.gwas_log10p" />
      <CtlTextfield :controlSet="controlConfig.eqtl_log10p" />
      <CtlSlider :controlSet="controlConfig.h4" />
      <CtlSlider :controlSet="controlConfig.r2" />
    </FilterPanelSubpanel>

    <FilterPanelSubpanel title="View" :resetButton="true" id="subPanelView">
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
  analysisTypes: { title: 'Analysis Types', storeKey: 'analysisTypes', rules: null, emptyValue: null, defaultValue: null, placeholder: 'Select analysis type(s)' },
  analysisTypePriority: { title: 'Analysis Type Priority', storeKey: 'analysisTypePriority', rules: null, emptyValue: null, defaultValue: ['gwas', 'eqtl'], placeholder: 'Select analysis type priority' },
  gene: { title: 'eQTL gene', storeKey: 'genes', rules: null, emptyValue: null, defaultValue: null, placeholder: 'Select gene(s)' },
  region: { title: 'Genomic Region', storeKey: 'region', items: null, rules: [rules.chrRegionRule], emptyValue: null, defaultValue: '', placeholder: 'chr:start-end' },
  phenotype: { title: 'GWAS Phenotype', storeKey: 'phenotypes', rules: null, emptyValue: null, defaultValue: null, placeholder: 'Select phenotype(s)' },
  tissue: { title: 'Tissue', storeKey: 'tissues', rules: null, emptyValue: null, defaultValue: null, placeholder: 'Select tissue(s)'},
  cell_type: { title: 'Cell Type', storeKey: 'cell_types', rules: null, emptyValue: null, defaultValue: null, placeholder: 'Select cell type(s)'},
  gwas_log10p: { title: 'GWAS -log<sub>10</sub> p-value ≥', storeKey: 'gwas_log10p', items: null, rules: [rules.posDecRule], emptyValue: '0', defaultValue: '0', placeholder: null },
  eqtl_log10p: { title: 'eQTL -log<sub>10</sub> p-value ≥', storeKey: 'eqtl_log10p', items: null, rules: [rules.posDecRule], emptyValue: '0', defaultValue: '0', placeholder: null },
  h4: { title: 'Colocalization PP(H4) ≥', topKey: 'filter', storeKey: 'h4', items: null, emptyValue: '0', defaultValue: THRESHOLDS.H4, placeholder: null },
  r2: { title: 'r² ≥', topKey: 'filter', storeKey: 'r2', items: null, emptyValue: '0', defaultValue: THRESHOLDS.R2, placeholder: null },
  colorCodeVariants: { title: 'Color-code variants', storeKey: 'colorCodeVariants', defaultValue: true },
  showEnsIDs: { title: 'Show Ensembl IDs', storeKey: 'showEnsIDs', defaultValue: false },
  showEffects: { title: 'Show effect sizes', storeKey: 'showEffects', defaultValue: false }
}

</script>

<style scoped>
</style>
