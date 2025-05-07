<template>
  <div>
    <span v-if="exonEnsID">
      <ToolTippy :isInteractive="true" >
        {{ middleTrim(exonEnsID, 3, 8) }}
        <template #tooltipContent>
          {{ exonEnsID }}
        </template>
      </ToolTippy>
    </span>
    <span v-else>
      <ToolTippy :isInteractive="true" >
        {{ middleTrim(geneEnsID, 3, 8) }}
        <template #tooltipContent>
          {{ geneEnsID }}
        </template>
      </ToolTippy>
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { middleTrim } from '@/util/util'
import ToolTippy from "@/components/DataTable/tooltips/ToolTippy.vue";

const props = defineProps({
  trait: Object,
})

const geneEnsID = computed(() => props?.trait?.gene?.ens_id)
const exonEnsID = computed(() => props?.trait?.exon?.ens_id)
</script>

<style scoped>
</style>
