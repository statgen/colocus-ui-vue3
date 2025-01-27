<template>
  <v-select
    @update:modelValue="onSelectUpdate"
    class="mt-3"
    :items="qcStore.studyList"
    v-model="qcStore.selectedStudyName"
    density="compact"
    :label="controlSet.caption"
    bg-color="white"
    flat
    variant="outlined"
    :width="controlSet.width"
  ></v-select>
</template>

<script setup>
import { useQCStore } from '@/stores/QCStore'

const qcStore = useQCStore()

const { controlSet } = defineProps({
  controlSet: {}
})

const onSelectUpdate = (newValue) => {
  qcStore.updateQCStoreKey(controlSet.dataKey, newValue)
}

</script>

<style scoped>
</style>
