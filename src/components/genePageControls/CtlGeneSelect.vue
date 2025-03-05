<template>
  <h3>{{ controlSet.title }}</h3>
  <v-autocomplete
    @update:model-value="onGeneChanged"
    :items="appStore.filterPanelControls.genes"
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
    v-model="appStore[genePage].selectedGene"
  ></v-autocomplete>
</template>

<script setup>
import { inject, onMounted, ref, watch  } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from "@/constants";
import { matchLowercase } from '@/util/util'

const appStore = useAppStore()

const { controlSet } = defineProps({
  controlSet: {}
})

const genePage = PAGE_NAMES.GENE

const resetInput = inject('resetInput')

watch(() => resetInput.value, () => {
  appStore[genePage].selectedGene = ''
})

const onGeneChanged = (newValue) => {
  appStore[genePage].selectedGene = newValue
  appStore[genePage].slidersEnabled = newValue?.length > 0
}

const mlc = ((itemTitle, queryText, item) => {
  return matchLowercase(queryText, itemTitle)
})

</script>

<style scoped>
</style>
