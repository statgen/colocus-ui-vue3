<template>
  <div>
    <span :class="cellClass">{{ cellLabel }}</span>
    <ConcordanceTooltip :item="item" />
  </div>
</template>

<script setup>
// *** Imports *****************************************************************
import { ref, watch } from 'vue'
import { useAppStore } from '@/stores/AppStore'

// *** Composables *************************************************************
const appStore = useAppStore()

// *** Props *******************************************************************
const props = defineProps({
  item: Object,
})

// *** Variables ***************************************************************
const cellClass = ref({})
const cellLabel = ref('')
const dirEffect = appStore.dataTable.dirEffect
const item = props.item
const uuid = ref(item.uuid)

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
const setCellLabel = ((dirEffect) => {
  if(!appStore.dataTable.isDirEffectReady) return

  const dir = dirEffect?.direction
  const missing = dirEffect?.hasMissing
  const discord = dirEffect?.discord

  if(discord) {
    cellClass.value = 'text-red'
    cellLabel.value = '⚠'
  } else if(dir === '+') {
    cellClass.value = 'text-blue'
    if (missing) {
      cellLabel.value = 'CON*'
    } else {
      cellLabel.value = 'CON'
    }
  } else if(dir === '-') {
    cellClass.value = 'text-purple'
    if (missing) {
      cellLabel.value = 'DIS*'
    } else {
      cellLabel.value = 'DIS'
    }
  } else {
    cellClass.value = ''
    cellLabel.value = ''
  }
})

watch(() => appStore.dataTable.isDirEffectReady, (newValue) => {
    if(newValue) {
      const u = uuid.value
      const de = dirEffect[u]
      setCellLabel(de)
    }
  }, { immediate: true }
)

// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
// *** Configuration data ******************************************************


</script>

<style scoped>
</style>
