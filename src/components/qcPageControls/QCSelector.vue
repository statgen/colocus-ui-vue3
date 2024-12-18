<template>
  <v-select
    @update:modelValue="onSelectUpdate"
    class="mt-3"
    :items="appStore[PAGE_NAMES.QC].studyList"
    v-model="selectedStudy"
    density="compact"
    :label="controlSet.caption"
    bg-color="white"
    flat
    variant="outlined"
    :width="controlSet.width"
  ></v-select>
</template>

<script setup>
import { ref, watch } from 'vue'
import { PAGE_NAMES } from '@/constants'
import { useAppStore } from '@/stores/AppStore'

const appStore = useAppStore()

const qcPage = PAGE_NAMES.QC

// const selectedStudy = ref(appStore[qcPage].selectedStudy) // undefined on initial load
const selectedStudy = ref('')

// this is necessary to populate the initial study on first load
watch(() => appStore[qcPage].studyList, async () => {
  const initialStudy = appStore[qcPage].studyList[0]
  appStore[qcPage].selectedStudy = initialStudy
  selectedStudy.value = initialStudy
})

const { controlSet } = defineProps({
  controlSet: {}
})

const onSelectUpdate = (newValue) => {
  appStore.updateQCpageKey(controlSet.dataKey, newValue)
}

</script>

<style scoped>
</style>
