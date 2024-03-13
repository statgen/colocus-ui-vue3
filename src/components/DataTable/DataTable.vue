<template>
  <v-data-table
    :headers="getTableHeaders()"
    :items="items"

    density="compact"
  >

  </v-data-table>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useFetchData } from '@/composables/fetchData'

const items = ref()

// const isLoading = ref(false)

// const headers = [
//   { title: 'Study 1', sortable: true, value: 'signal1.analysis.study.uuid' },
//   { title: 'Study 1 Trait 1', sortable: true, value: 'signal1.analysis.trait.phenotype.name'},
//   { title: 'Study 2', sortable: true, value: 'signal2.analysis.study.uuid' },
//   { title: 'Study 2 Trait 2', sortable: true, value: 'signal2.analysis.trait.gene.symbol'},
// ]

const show_ensg = true
const show_effects = true
const showAddPlotIcon = true

const getTableHeaders = (() => {
  const base = [];
  // const has_gwas = this.traitTypes.includes(ANALYSIS_TYPES.GWAS);
  const has_eqtl = true // this.analysisTypes.includes(ANALYSIS_TYPES.EQTL);

  if (showAddPlotIcon) base.push({ title: 'Add plots', value: 'actions', sortable: false });

  base.push({ title: 'Study 1', sortable: true, value: 'signal1.analysis.study.uuid' });

  // if (this.show_trait1) {
    // Some views treat trait 1 as fixed, and labeled somewhere else, so it is not needed in the table
    // if (has_eqtl) {
    //   base.unshift({ title: 'Trait 1 Tissue', sortable: true, value: 'signal1.analysis.trait.tissue' });
    // }
    base.push({ title: 'Trait 1', sortable: true, value: 'signal1.analysis.trait.uuid' });
  // }

  base.push({ title: 'Study 2', sortable: true, value: 'signal2.analysis.study.uuid' });

  if (has_eqtl) {
    base.push({ title: 'Trait 2', sortable: true, value: 'signal2.analysis.trait.uuid' });
    base.push({ title: 'Trait 2 Type', sortable: false, value: 'signal2.analysis.trait.biomarker_type' });
    if (show_ensg) {
      base.push({ title: 'Trait 2 ENSG', sortable: true, value: 'signal2.analysis.trait.gene.ens_id' });
    }
  } else {
    base.push({ title: 'Trait 2', sortable: true, value: 'signal2.analysis.trait.uuid' });
  }

  if (has_eqtl) {
    base.push({ title: 'Trait 2 Tissue', sortable: true, value: 'signal2.analysis.tissue' });
  }

  base.push(...[
    { title: 'Trait 1 Variant', sortable: true, value: 'signal1.lead_variant.vid' },
    { title: 'Trait 2 Variant', sortable: true, value: 'signal2.lead_variant.vid' },
    { title: 'Trait 1 -log10p', sortable: true, value: 'signal1.neg_log_p' },
    { title: 'Trait 2 -log10p', sortable: true, value: 'signal2.neg_log_p' },
    { title: 'H3', sortable: true, value: 'coloc_h3' },
    { title: 'H4', sortable: true, value: 'coloc_h4' },
    { title: 'R2', sortable: true, value: 'r2' },
    { title: '# coloc between traits', sortable: true, value: 'n_coloc_between_traits', width: '20px' },
    { title: 'Effect Direction Concordance', align: 'center', sortable: false, value: 'cross_signal.effect', width: '140px' }
  ]);

  if (show_effects) {
    base.push(...[
      { title: 'Trait 1 Marginal Effect', sortable: true, value: 'signal1.effect_marg' },
      { title: 'Trait 2 Marginal Effect', sortable: true, value: 'signal2.effect_marg' },
      { title: 'Trait 1 Cond Effect', sortable: true, value: 'signal1.effect_cond' },
      { title: 'Trait 2 Cond Effect', sortable: true, value: 'signal2.effect_cond' },
      { title: 'Effect Flipped Marg ↔ Cond', sortable: true, value: 'marg_cond_flip' }
    ]);
  }

  return base;
})


onMounted(async() => {
  await loadFilterData()
});

const loadFilterData = (async () => {
  // isLoading.value = true
  const { data, isLoading, hasError, errorMessage, fetchData } = useFetchData();

  await fetchData('/api/v1/coloc/');
  // isLoading.value = false
  if(hasError.value) {
    throw new Error(errorMessage.value)

  } else {
    items.value = data.value.results
    // console.log(items.value)
    // console.log(items.value[0].r2)
    // console.log(items.value[0].signal1.analysis.trait.phenotype.name)
  }
})
</script>

<style scoped>
</style>
