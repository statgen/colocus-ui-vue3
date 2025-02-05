<template>
<v-container class="ml-2">
  <v-row class="mt-1">
    <h3>{{ controlSet.caption }}</h3>
  </v-row>

  <v-row class="mt-n2">

  <v-select
    :items="qcStore.studyList"
    :max-width="controlSet.width"

    v-model="qcStore.selectedStudyName"
    @update:modelValue="onSelectUpdate"

    bg-color="white"
    class="mt-3"
    density="compact"
    flat
    variant="outlined"
  ></v-select>
  </v-row>
</v-container>
</template>

<script setup>
import { inject, ref, watch } from 'vue'
import { useQCStore } from '@/stores/QCStore'

const qcStore = useQCStore()

const { controlSet } = defineProps({
  controlSet: {}
})

const resetSelect = inject('resetSelect')

const emit = defineEmits(['resetSliders'])


const onSelectUpdate = (newValue) => {
  qcStore.updateQCStoreKey(controlSet.dataKey, newValue)
  emit('resetSliders')
}

watch(() => resetSelect.value, () => {
  qcStore.updateQCStoreKey(controlSet.dataKey, qcStore.studyList[0])
})
</script>

<style scoped>
</style>
