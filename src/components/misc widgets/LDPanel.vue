<template>
  <div :style="panelStyle" class="ma-0 px-2 pt-2 pb-0">

    <v-row class="my-0 py-0">
      <v-col cols="3" class="my-0 py-0">
        <h4 class="text-right mt-2">Y-axis:</h4>
      </v-col>
      <v-col class="my-0 py-0">
        <v-radio-group inline :model-value="selectedMCRadio" @update:model-value="onCMRadioChange">
          <v-radio value="t2">
            <template v-slot:label>Conditional -log<sub>10</sub> p </template>
          </v-radio>
          <v-radio value="t1">
              <template v-slot:label>Marginal -log<sub>10</sub> p </template>
          </v-radio>
        </v-radio-group>
      </v-col>
    </v-row>

    <v-row class="my-0 py-0">
      <v-col cols="3" class="my-0 py-0">
        <h4 class="text-right my-0 py-0">LD Reference:</h4>
      </v-col>
      <v-col class="my-0 py-0 ml-2">
        <v-radio-group :model-value="selectedLDRadio" @update:model-value="onLDRadioChange" density="compact">
          <v-radio v-for="(ld_ref, index) in ld_refs" :key="index" :value="ld_ref">
            <template v-slot:label>
              <VariantLabel :variant="ld_ref"/>
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

const filterStore = useFilterStore()

const props = defineProps({
  ld_refs: Array,
})

const selectedLDRadio = ref(props.ld_refs[0])
const selectedMCRadio = ref(AXIS_OPTIONS.CONDITIONAL)

const emit = defineEmits(['onCMRadioChange', 'onLDRadioChange'])

watch(() => filterStore.colocDataReady, async (newVal) => {
  if(newVal) {
    selectedLDRadio.value = filterStore.colocData.signal1.lead_variant.vid
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

const panelStyle = {
  width: '525px',
  left: '500px',
  /*backgroundColor: '#fafafa',*/
  borderColor: '#ff3d00',
  borderWidth: '1px',
  borderStyle: 'solid',
}

</script>

<style scoped>
/* The following uses a Vue-specific notation (:deep()) to select child components.
   Needed to hide an unused subcomponent of the v-select taking up vertical space. */
:deep() .v-input__details {
  display: none !important;
}

/* The following uses a Vue-specific notation (/deep/) to select child components.
   Needed to hide unused subcomponent of v-radio taking up vertical space. */
/*/deep/ .v-messages.theme--light {
  min-height: 0;
  display: none !important;
}*/

/*
/deep/ .v-selection-control v-selection-control--dirty v-selection-control--density-default v-radio {
  height: 20px;
}
*/

/*
.panelStyle {
  width: 500px;
  background-color: #fafafa;
  border-color: #ff3d00;
  border-width: 1px;
  border-style: solid;
}
*/
</style>

