<template>
  <FilterPanelSubpanel title="Select">
    <CtlAutocomplete :propSet="controlConfig.study" />
    <CtlAutocomplete :propSet="controlConfig.gene" />
    <CtlTextfield :propSet="controlConfig.region" />
    <CtlAutocomplete :propSet="controlConfig.phenotype" />
    <CtlAutocomplete :propSet="controlConfig.tissue" />
  </FilterPanelSubpanel>

  <FilterPanelSubpanel title="Set threshold">
    <CtlTextfield :propSet="controlConfig.trait1" />
    <CtlTextfield :propSet="controlConfig.trait2" />
    <CtlTextfield :propSet="controlConfig.h4" />
    <CtlTextfield :propSet="controlConfig.r2" />
  </FilterPanelSubpanel>

  <FilterPanelSubpanel title="View">
    <CtlSwitch :propSet="controlConfig.showEnsIDs" />
    <CtlSwitch :propSet="controlConfig.showEffects" />
  </FilterPanelSubpanel>
</template>

<script setup>
import { useFilterStore } from '@/stores/FilterStore';

const filterStore = useFilterStore();

const POS_DECIMAL_REGEX = /^\d*\.?\d*$/
const CHR_REGION_REGEX = /^[12]\d?:\d+-\d+$/

const rules = {
  posDecRule: v => (!!v && POS_DECIMAL_REGEX.test(v)) || "Must be positive number ≥ 0",
  probabilityRule: v => (!!v && POS_DECIMAL_REGEX.test(v) && v >= 0 && v <= 1) || "Must be positive, 0 ≤ value ≤ 1",
  chrRegionRule: v => !v || (!!v && CHR_REGION_REGEX.test(v)) || 'Must match chromosome:start-end, all integers',
}

// fake data for initial build out
const studies = ['AdipoExpress', 'CARDioGRAMplusC4D', 'DIAGRAM', 'GIANT', 'GLGC', 'ICBP-UKBB', 'MAGIC', 'UKBB']
const phenotypes = ['phenotype 1', 'phenotype 2', 'phenotype 3', 'phenotype 4',]
const tissues = ['tissue 1', 'tissue 2', 'tissue 3', 'tissue 4',]
const genes = ['Gene 1', 'Gene 2', 'Gene 3', 'Gene 4', 'Gene 5', 'Gene 6', 'Gene 7', 'Gene 8', 'Gene 9', 'Gene 10' ]

// data for configuring controls
const controlConfig = {
  study: {
    title: 'Study', storeKey: 'studies', items: studies, rules: null, placeholder: 'Select study(ies)', defValue: null
  },
  gene: {
    title: 'QTL Gene', storeKey: 'genes', items: genes, rules: null, placeholder: 'Select gene(s)', defValue: null
  },
  region: {
    title: 'Genomic Region', storeKey: 'region', items: null, rules: [rules.chrRegionRule], placeholder: 'chr:start-end', defValue: null
  },
  phenotype: {
    title: 'GWAS Phenotype', storeKey: 'phenotypes', items: phenotypes, rules: null, placeholder: 'Select phenotype(s)', defValue: null
  },
  tissue: {
    title: 'QTL Tissue', storeKey: 'tissues', items: tissues, rules: null, placeholder: 'Select tissue(s)', defValue: null
  },
  trait1: {
    title: 'Trait 1 -log<sub>10</sub> p-value ≥', storeKey: 'trait1log10p', items: null, rules: [rules.posDecRule], placeholder: null, defValue: '0'
  },
  trait2: {
    title: 'Trait 2 -log<sub>10</sub> p-value ≥', storeKey: 'trait2log10p', items: null, rules: [rules.posDecRule], placeholder: null, defValue: '0'
  },
  h4: {
    title: 'Colocalization PP(H4) ≥', storeKey: 'h4', items: null, rules: [rules.probabilityRule], placeholder: null, defValue: '0'
  },
  r2: {
    title: 'r<sup>2</sup> ≥', storeKey: 'r2', items: null, rules: [rules.probabilityRule], placeholder: null, defValue: '0'
  },
  showEnsIDs: {
    title: 'Show Ensembl IDs', storeKey: 'showEnsIDs', items: null, rules: null, placeholder: null
  },
  showEffects: {
    title: 'Show effect sizes', storeKey: 'showEffects', items: null, rules: null, placeholder: null
  }
}
</script>

<style >
</style>
