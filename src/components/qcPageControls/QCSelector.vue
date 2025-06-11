<template>
  <h3>{{ controlSet.caption }}</h3>

  <v-select
    :items="qcStore.studyList"

    v-model="qcStore.selectedStudyName"
    @update:modelValue="onSelectUpdate"

    bg-color="white"
    class="mt-3"
    density="compact"
    flat
    variant="outlined"
  ></v-select>
</template>

<script setup>
import { inject, watch } from 'vue'
import { useQCStore } from '@/stores/QCStore'

const qcStore = useQCStore()

const { controlSet } = defineProps({
  controlSet: {}
})

const resetInput = inject('resetInput')

const onSelectUpdate = (newValue) => {
  qcStore.updateQCStoreKey(controlSet.storeKey, newValue)
  qcStore.resetSlidersFlag = !qcStore.resetSlidersFlag
}

watch(() => resetInput.value, () => {
  qcStore.updateQCStoreKey(controlSet.storeKey, qcStore.defaultStudy)
})
</script>

<style scoped>
</style>
