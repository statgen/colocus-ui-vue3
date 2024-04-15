<template>
  <div>
    <span :class="cellClass">{{ cellLabel }}</span>
    <ConcordanceTooltip :item="item" />
  </div>
</template>

<script setup>
// *** Imports *****************************************************************
import { ref, watch } from 'vue'
import { useFilterStore } from '@/stores/FilterStore'

// *** Composables *************************************************************
const filterStore = useFilterStore()

// *** Props *******************************************************************
const props = defineProps({
  item: Object,
})

// *** Variables ***************************************************************
const cellClass = ref({})
const cellLabel = ref('')
const dirEffect = filterStore.dirEffect
const item = props.item
const uuid = ref(item.uuid)

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
const setCellLabel = ((dirEffect) => {
  if(!filterStore.isDirEffectReady) return

  const dir = dirEffect.direction
  const missing = dirEffect.hasMissing
  const discord = dirEffect.discord

  if(discord) {
    cellClass.value = 'text-red'
    cellLabel.value = '⚠'
  } else if(missing) {
    cellClass.value = 'text-red-lighten-1'
    cellLabel.value = 'MISS'
  } else if(dir === '+') {
    cellClass.value = 'text-blue'
    cellLabel.value = 'CON'
  } else if(dir === '-') {
    cellClass.value = 'text-purple'
    cellLabel.value = 'DIS'
  }
})

watch(() => filterStore.isDirEffectReady, (newValue) => {
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
