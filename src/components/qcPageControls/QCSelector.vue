<template>
  <v-select
    @update:modelValue="onSelectUpdate"
    class="mt-3"
    :items="qcStore.studyList"
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
import { useQCStore } from '@/stores/QCStore'

const qcStore = useQCStore()

const qcPage = PAGE_NAMES.QC

const selectedStudy = ref('')

// this is necessary to populate the selected study on initial load
watch(() => qcStore.studyList, async () => {
  const initialStudy = qcStore.studyList[0]
  qcStore.selectedStudy = initialStudy
  selectedStudy.value = initialStudy
})

const { controlSet } = defineProps({
  controlSet: {}
})

const onSelectUpdate = (newValue) => {
  qcStore.updateQCStoreKey(controlSet.dataKey, newValue)
}

</script>

<style scoped>
</style>
