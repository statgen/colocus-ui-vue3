<template>
  <div class="plot-action-menu" :style="menuStyle" v-click-outside="onCloseMenu">
    <ul>
      <li><label><input type="checkbox" v-model="recombChecked"/> Show recomb line</label></li>
      <li @click.self="onToggleGenSigLine"><label><input type="checkbox" /> Show gen sig line</label></li>
      <li @click.self="onExportPlot">⬇ Export PNG</li>
      <li @click.self="onDeletePlot">🗑 Delete Plot</li>
    </ul>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import {PAGE_NAMES} from "@/constants";

const appStore = useAppStore()

defineProps({
  menuStyle: Object
})

const emit = defineEmits([
  'delete-plot',
  'toggle-recomb-line',
  'toggle-gen-sig-line',
  'export-plot',
  'close-menu'
])

const recombChecked = computed({
  get: () => {
    const plotID = appStore[PAGE_NAMES.MULTIZOOM].activePlot
    return appStore[PAGE_NAMES.MULTIZOOM].plotSettings[plotID]?.showRecombLine ?? false
  },
  set: (val) => {
    const plotID = appStore[PAGE_NAMES.MULTIZOOM].activePlot
    // console.log(`new chk value: ${val} for plot: ${plotID}`)
    appStore[PAGE_NAMES.MULTIZOOM].plotSettings[plotID].showRecombLine = val
  }
})

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})

const onCloseMenu = () => {
  emit('close-menu')
}

const onDeletePlot = () => {
  emit('delete-plot')
}

const onExportPlot = () => {
  emit('export-plot')
}

const onKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close-menu')
  }
}

const onToggleRecombLine = () => {
  emit('toggle-recomb-line')
}

const onToggleGenSigLine = () => {
  emit('toggle-gen-sig-line')
}
</script>

<style scoped>
.plot-action-menu {
  position: absolute;
  background-color: rgba(var(--v-theme-clcTooltipBackground), 1.0);
  border: 1px solid rgba(var(--v-theme-clcTooltipBorder), 1.0);
  border-radius: 6px;
  z-index: 9999;
  padding: 2px 4px;
  min-width: 160px;
  font-size: 0.9rem;
  width: 225px;
}

.plot-action-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.plot-action-menu li {
  padding: 2px 8px;
  cursor: pointer;
  user-select: none;
}

.plot-action-menu li:hover {
  background-color: #ffffff;
}

.plot-action-menu input[type="checkbox"] {
  pointer-events: auto;
}
</style>
