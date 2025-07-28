<template>
  <div class="plot-action-menu" :style="menuStyle" v-click-outside="onCloseMenu">
    <ul>
      <li @click="onToggleRecombLine"><label><input type="checkbox" checked readonly /> Show recombination line</label></li>
      <li @click="onToggleGenSigLine"><label><input type="checkbox" checked readonly /> Show gen sig line</label></li>
      <li @click="onExportPlot">⬇ Export PNG</li>
      <li @click="onDeletePlot">🗑 Delete Plot</li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

defineProps({
  menuStyle: Object
})

const emit = defineEmits([
  'deletePlot',
  'toggleRecombLine',
  'toggleGenSigLine',
  'exportPlot',
  'closeMenu'
])

const onCloseMenu = () => {
  emit('closeMenu')
}

const onDeletePlot = () => {
  emit('deletePlot')
  emit('closeMenu')
}

const onExportPlot = () => {
  emit('exportPlot')
  emit('closeMenu')
}

const onKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('closeMenu')
  }
}

const onToggleGenSigLine = () => {
  emit('onToggleGenSigLine')
}

const onToggleRecombLine = () => {
  emit('toggleRecombLine')
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})
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
</style>
