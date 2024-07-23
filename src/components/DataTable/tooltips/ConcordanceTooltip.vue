<template>
  <v-tooltip activator="parent" location="top">
    <span v-if="discord" class="text-body-1">Effects are inconsistent</span>
    <span v-else-if="missing" class="text-body-1">At least one effect is missing</span>
    <table>
      <thead>
        <tr>
          <td></td>
          <td>Trait 1</td>
          <td>Trait 2</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="rpad">Variant 1</td>
          <td :class="getClass(effect[0][0])">{{ formatEffect(effect[0][0]) }}</td>
          <td :class="getClass(effect[0][1])">{{ formatEffect(effect[0][1]) }}</td>
        </tr>
        <tr>
          <td class="rpad">Variant 2</td>
          <td :class="getClass(effect[1][0])">{{ formatEffect(effect[1][0]) }}</td>
          <td :class="getClass(effect[1][1])">{{ formatEffect(effect[1][1]) }}</td>
        </tr>
      </tbody>
    </table>
  </v-tooltip>
</template>

<script setup>
// *** Imports *****************************************************************
import { inject, ref, watch } from 'vue'
import { useAppStore } from '@/stores/AppStore'

// *** Composables *************************************************************
const appStore = useAppStore()

// *** Props *******************************************************************
const props = defineProps({
  item: Object,
})

// *** Variables ***************************************************************
const dirEffect = appStore.dataTable.dirEffect
const discord = ref(Boolean)
const item = props.item
const effect = item.cross_signal.effect
const missing = ref(Boolean)
const showValues = false // for debugging, set to true
const uuid = ref(item.uuid)

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
watch(() => appStore.dataTable.isDirEffectReady, (newValue) => {
  if(newValue) {
    const x = dirEffect[uuid.value]
    discord.value = x.discord
    missing.value = x.hasMissing
  }
}, { immediate: true } )

// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
const formatEffect = ((s) => {
  if(showValues) return s.toFixed(3)
  if (s) {
    if (s > 0) {
      return '+'
    } else if (s === 0) {
      return '0'
    } else {
      return '-'
    }
  } else {
    return s
  }
})

const getClass = ((beta) =>{
  if(beta > 0) return 'bg-clcEffPos'
  else if (beta < 0) return 'bg-clcEffNeg'
  else if (beta === 0) return 'bg-clcEffZero'
  else return 'bg-clcEffNA'
})

// *** Configuration data ******************************************************
</script>

<style scoped>
td {
  text-align: center;
  font-weight: bold;
  font-size: 0.875rem;
}

.rpad {
  padding-right: 4px;
}
</style>
