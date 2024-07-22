<template>
  <div :style="panelStyle" class="ma-0 px-2 pt-2 pb-0">

    <v-row class="my-0 py-0">
      <v-col cols="3" class="my-0 py-0">
        <h4 class="text-right mt-2">Uniques:</h4>
      </v-col>
      <v-col class="my-0 py-0">
        <v-checkbox
          @update:model-value="onUniqueCheckboxChange"
          :label="`When adding plots, only add unique signals`"
          color="clcAction"
          density="compact"
        ></v-checkbox>
      </v-col>
    </v-row>

    <v-row class="my-0 py-0">
      <v-col cols="3" class="my-0 py-0">
        <h4 class="text-right mt-0">Y-axis:</h4>
      </v-col>
      <v-col class="my-0 py-0">
        <v-radio-group inline :model-value="selectedMCRadio" @update:model-value="onCMRadioChange" density="compact">
          <v-radio value="t2" color="clcAction">
            <template v-slot:label>Conditional -log<sub>10</sub> p </template>
          </v-radio>
          <v-radio value="t1" color="clcAction">
            <template v-slot:label>Marginal -log<sub>10</sub> p </template>
          </v-radio>
        </v-radio-group>
      </v-col>
    </v-row>

    <v-row class="my-0 pb-2">
      <v-col cols="3" class="my-0 py-0">
        <h4 class="text-right my-0 py-0">LD Reference:</h4>
      </v-col>
      <v-col class="my-0 py-0">
        <v-radio-group :model-value="selectedLDRadio" @update:model-value="onLDRadioChange" density="compact">
          <v-radio v-for="(ldRef, index) in filterStore.uniqueLDrefs" :key="index" :value="ldRef" color="clcAction">
            <template v-slot:label>
                <span :style="{color: colorHasher.hex(ldRef)}">
                  {{ formatVariantString(ldRef) }}
                </span>
            </template>
          </v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { AXIS_OPTIONS } from '@/constants'
import { useFilterStore } from '@/stores/FilterStore'
import { colorHasher, formatVariantString } from '@/util/util'

const filterStore = useFilterStore()
const selectedLDRadio = ref(null)
const selectedMCRadio = ref(AXIS_OPTIONS.CONDITIONAL)

const props = defineProps({
  regionPanelRemoved: Boolean,
})

const emit = defineEmits(['onCMRadioChange', 'onLDRadioChange', 'onUniqueCheckboxChange'])

watch(() => filterStore.colocDataReady, async (newVal) => {
  if(newVal) {
    selectedLDRadio.value = filterStore.colocData.signal1.lead_variant.vid
  }
})

watch(() => filterStore.regionPanelRemoved, async (newVal) => {
  if(filterStore.uniqueLDrefs.length > 0) {
    const variant = filterStore.uniqueLDrefs[0]
    selectedLDRadio.value = variant
  }
})

const onCMRadioChange = (value) => {
  selectedMCRadio.value = value
  emit('onCMRadioChange', value)
}

const onLDRadioChange = (value) => {
  selectedLDRadio.value = value
  emit('onLDRadioChange', value)
}

const onUniqueCheckboxChange = (value) => {
  emit('onUniqueCheckboxChange', value)
}

const panelStyle = {
  width: '600px',
  backgroundColor: '#fdfdfd',
  borderColor: '#18c11c', // 'border-clcAction' doesn't work... FIXME
  borderWidth: '2px',
  borderStyle: 'solid',
}
</script>

<style scoped>
/* The following uses a Vue-specific notation (:deep()) to select child components.
   Needed to hide an unused subcomponent of the radio group taking up vertical space. */
:deep() .v-input__details {
  display: none !important;
}
</style>
