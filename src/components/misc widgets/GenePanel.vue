<template>
  <v-sheet class="bg-clcBackground mt-2" elevation="0" border>
    <div class="d-flex align-center px-0">
      <ToolTippy>
        <v-icon icon="mdi-minus-circle-outline" @click="onResetButtonClick" class="reset-icon-class" />
        <template #tooltipContent>
          Reset to default values
        </template>
      </ToolTippy>
      <h2 class="mb-2 d-inline-flex">
        Gene Settings
      </h2>
    </div>
      <v-container class="mt-n2">
        <h3>QTL gene</h3>
        <v-autocomplete
          @update:model-value="onGeneChanged"
          :items="geneList"
          :custom-filter="mlc"
          auto-select-first
          bg-color="white"
          class="mb-n1"
          clear-on-select
          closable-chips
          density="compact"
          flat
          persistent-clear
          variant="outlined"
          v-model="selectedGene"
        ></v-autocomplete>

        <h3>{{ h4label }}</h3>
        <v-slider
          @end="onh4SliderUpdate"
          :disabled="!slidersEnabled"
          :min="0"
          :max="1.0"
          :step="0.1"
          v-model="h4value"
          show-ticks="always"
          thumb-size="12"
        ></v-slider>

        <h3>{{ r2label }}</h3>
        <v-slider
          @end="onr2SliderUpdate"
          :disabled="!slidersEnabled"
          :min="0"
          :max="1.0"
          :step="0.1"
          v-model="r2value"
          show-ticks="always"
          thumb-size="12"
        ></v-slider>
      </v-container>
  </v-sheet>
</template>

<script setup>
// *** Imports *****************************************************************
import { inject, onMounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { THRESHOLDS } from '@/constants'
import { matchLowercase } from '@/util/util'

// *** Composables *************************************************************
const appStore = useAppStore()

// *** Props *******************************************************************
// *** Variables ***************************************************************
const h4value = ref(THRESHOLDS.H4)
const h4label = ref(`h4 ≥ ${THRESHOLDS.H4}`)

const r2value = ref(THRESHOLDS.R2)
const r2label = ref(`r2 ≥ ${THRESHOLDS.R2}`)

const geneList = ref([])
const selectedGene = ref('')

const slidersEnabled = ref(false)

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
const emit = defineEmits(['onGeneSettingsChange'])

// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
onMounted(() => {
  geneList.value = appStore.filterPanelControls.genes
})

// *** Event handlers **********************************************************
const onGeneChanged = (newValue) => {
  selectedGene.value = newValue
  slidersEnabled.value = newValue?.length
  onGeneSettingsChange()
}

const onGeneSettingsChange = () => {
  const settings = {
    h4: h4value.value,
    r2: r2value.value,
    theGene: selectedGene.value,
  }
  emit('onGeneSettingsChange', settings)
}

const onh4SliderUpdate = (val) => {
  h4label.value = `h4 ≥ ${h4value.value}`
  onGeneSettingsChange()
}

const onr2SliderUpdate = (val) => {
  r2label.value = `r2 ≥ ${r2value.value}`
  onGeneSettingsChange()
}

const onResetButtonClick = () => {
  selectedGene.value = ''
  h4value.value = THRESHOLDS.H4
  h4label.value = `h4 ≥ ${h4value.value}`
  r2value.value = THRESHOLDS.R2
  r2label.value = `r2 ≥ ${r2value.value}`
  slidersEnabled.value = false
  onGeneSettingsChange()
}

// *** Utility functions *******************************************************
const mlc = ((itemTitle, queryText, item) => {
  return matchLowercase(queryText, itemTitle)
})

// *** Configuration data ******************************************************
</script>

<style scoped>
</style>
