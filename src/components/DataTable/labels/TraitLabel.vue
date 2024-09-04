<template>
  <div class="d-inline">
    <span v-if="theBiomarkerType === BIOMARKER_TYPES.PHENOTYPE">
      <span v-if="theAbbrev">
        <ToolTippy :isInteractive="isInteractive">
          <span class="trait-highlight">{{ theUUID }}</span>
          <template #tooltipContent>
            {{ thePhenotype }}
          </template>
        </ToolTippy>
      </span>
      <span v-else :class="highlight ? 'text-indigo-darken-4' : '' ">
        {{ thePhenotype }}
      </span>
    </span>

    <span v-else-if="theGene">
      <span v-if="abbrev">
        <ToolTippy :isInteractive="isInteractive">
          {{ middleTrim(theGene, 6, 6) }}
          <template #tooltipContent>
            <div @click.stop>
              {{ theGene }}
            </div>
          </template>
        </ToolTippy>
      </span>
      <span v-else>
        {{ theGene }}
      </span>
    </span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { BIOMARKER_TYPES } from '@/constants'
import { middleTrim } from '@/util/util'
import ToolTippy from "@/components/DataTable/tooltips/ToolTippy.vue";

const props = defineProps({
  trait: Object,
  abbrev: Boolean,
  highlight: Boolean,
  isInteractive: Boolean,
})

const theAbbrev = computed(() => props?.abbrev)
const theBiomarkerType = computed(() => props?.trait?.biomarker_type)
const theGene = computed(() => props?.trait?.gene?.symbol)
const thePhenotype = computed(() => props?.trait?.phenotype?.name)
const theUUID = computed(() => props?.trait?.uuid)

</script>

<style scoped>
.trait-highlight {
  border-bottom: 1px rgba(var(--v-theme-clcAction), 1.0) dashed;
  color: rgba(var(--v-theme-clcAction), 1.0);
}

</style>
