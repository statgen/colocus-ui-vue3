<template>
  <div>
    <p v-if="signal1?.neg_log_p === 'Infinity'">
      <span class="text-red text-h6 font-weight-bold">⚠</span>
      The lead variant for <TraitLabel :trait="signal1?.analysis?.trait" />
      has a p-value of 0, so the -log<sub>10</sub>p
      value is infinity. It cannot be displayed on the plot above.
    </p>
    <p v-if="signal2?.neg_log_p === 'Infinity'">
      <span class="text-red text-h6 font-weight-bold">⚠</span>
      The lead variant for <TraitLabel :trait="signal2?.analysis?.trait" />
      has a p-value of 0, so the -log<sub>10</sub>p
      value is infinity. It cannot be displayed on the plot above.
    </p>
    <p v-if="signal1?.cond_minp_variant && signal1?.lead_variant?.vid !== signal1?.cond_minp_variant">
      <span class="text-red text-h6 font-weight-bold">⚠</span>
      The lead variant <VariantLabel :variant="signal1?.lead_variant?.vid" />
      shown for <TraitLabel :trait="signal1?.analysis?.trait" />
      is not the most significant variant for this conditionally distinct signal {{ signal1?.cond_minp_variant }}.
      For this trait, the published conditionally distinct variants were used to perform colocalization analysis.
      The SNP association results for this conditionally distinct signal
      may have been obtained using different software, parameters or LD panels than the published GWAS study.
    </p >
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'

const appStore = useAppStore()

const signal1 = ref(null)
const signal2 = ref(null)

watch(() => appStore[PAGE_NAMES.LOCUSZOOM].colocDataReady, async (newVal) => {
  if(newVal) {
    signal1.value = appStore[PAGE_NAMES.LOCUSZOOM].colocData.signal1
    signal2.value = appStore[PAGE_NAMES.LOCUSZOOM].colocData.signal2
  }
})

</script>

<style scoped>
</style>
