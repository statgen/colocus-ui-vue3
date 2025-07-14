<template>
  <Teleport to="body">
    <div
      v-if="tooltipStore.isVisible && tooltipStore.content"
      class="lz-tooltip-content"
      :style="{
        position: 'fixed',
        left: `${tooltipStore.position.x + 10}px`,
        top: `${tooltipStore.position.y + 10}px`,
        pointerEvents: 'none',
        zIndex: 9999
      }"
    >
      <table v-if="typeof tooltipStore.content === 'object'">
        <tbody>
          <tr><td>Variant</td><td>{{ tooltipStore.content.variant }}</td></tr>
          <tr><td>Position</td><td>{{ tooltipStore.content.position }}</td></tr>
          <tr><td>Ref Allele</td><td>{{ tooltipStore.content.refAllele }}</td></tr>
          <tr><td>-log<sub>10</sub> p-value</td><td>{{ tooltipStore.content.pValue }}</td></tr>
          <tr><td>r²</td><td>{{ tooltipStore.content.r2 }}</td></tr>
        </tbody>
      </table>
      <div v-else>{{ tooltipStore.content }}</div>
    </div>
  </Teleport>
</template>

<script setup>
import { useLZTooltipStore } from '@/stores/LZTooltipStore'

const tooltipStore = useLZTooltipStore()
</script>

<style scoped>
.lz-tooltip-content {
  background-color: rgba(var(--v-theme-clcTooltipBackground), 1.0);
  color: black;
  padding: 2px 4px;
  border-radius: 6px;
  border: 1px solid rgba(var(--v-theme-clcTooltipBorder), 1.0);
  font-size: 0.9rem;
  white-space: nowrap;
}

.lz-tooltip-content table {
  border-collapse: collapse;
}

.lz-tooltip-content td {
  padding: 2px 0 0 8px;
}
</style>
