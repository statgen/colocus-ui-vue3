<template>
  <div>
    <span v-if="trait.exon">
      <v-tooltip activator="parent" location="top">
        {{ trait.exon.ens_id }}
      </v-tooltip>
      {{ middleTrim(trait.exon.ens_id, 3, 8) }}
    </span>
    <span v-else>
      <v-tooltip activator="parent" location="top">
        {{ trait.gene.ens_id }}
      </v-tooltip>
      {{ middleTrim(trait.gene.ens_id, 3, 8) }}
    </span>
  </div>
</template>

<script setup>
import { middleTrim } from '@/util/util'

const props = defineProps({
  trait: Object,
})
</script>

<style scoped>
</style>
