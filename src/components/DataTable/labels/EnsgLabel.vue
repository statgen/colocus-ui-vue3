<template>
  <div>
    <span v-if="exonEnsID">
      <v-tooltip activator="parent" location="top">
        {{ exonEnsID }}
      </v-tooltip>
      {{ middleTrim(exonEnsID, 3, 8) }}
    </span>
    <span v-else>
      <v-tooltip activator="parent" location="top">
        {{ geneEnsID }}
      </v-tooltip>
      {{ middleTrim(geneEnsID, 3, 8) }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { middleTrim } from '@/util/util'

const props = defineProps({
  trait: Object,
})

const geneEnsID = computed(() => props?.trait?.gene?.ens_id)
const exonEnsID = computed(() => props?.trait?.exon?.ens_id)
</script>

<style scoped>
</style>
