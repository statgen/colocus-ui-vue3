<template>
  <div
    :id="cellId"
    class="plot-cell"
    :style="{ gridRow: row + 1, gridColumn: col + 1 }"
    :data-cell="cellKey"
  >
    <!-- +1 offset accounts for header row/column at position 1
         Logical row 1 → CSS gridRow 2, Logical col 1 → CSS gridColumn 2 -->
    <!-- Mock plot display -->
    <div
      v-if="isMock"
      class="mock-plot"
      @click.stop="onClick"
      @contextmenu.prevent.stop="onContextMenu"
    >
      <div class="mock-content">
        {{ cellLabel }}
      </div>
    </div>

    <!-- Real plot display - dynamic LZ2RegionPlot component -->
    <component
      v-else-if="plotConfig"
      :is="LZ2RegionPlot"
      v-bind="plotProps"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'
import LZ2RegionPlot from '@/components/LZ2Components/LZ2RegionPlot.vue'

const props = defineProps({
  row: { type: Number, required: true },
  col: { type: Number, required: true },
  plotId: { type: [String, Number], default: null }
})

const appStore = useAppStore()
const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]

const emit = defineEmits(['mock-click', 'mock-menu'])

// *** Computed ****************************************************************
const isMock = computed(() => !props.plotId)

const cellKey = computed(() => `${props.row},${props.col}`)

const cellId = computed(() => `cell_${props.row}_${props.col}`)

const cellLabel = computed(() => {
  const colLabel = columnLabel(props.col)
  return `${colLabel}${props.row}`
})

/**
 * Get plot configuration from registry
 */
const plotConfig = computed(() => {
  if (!props.plotId) return null
  return storeMZpage.plotRegistry?.[props.plotId] || null
})

/**
 * Build props to pass to LZ2RegionPlot component
 * Maps from your plotRegistry structure to component props
 */
const plotProps = computed(() => {
  if (!plotConfig.value) return {}

  const config = plotConfig.value

  return {
    ID: props.plotId,
    showGenSigLine: config.showGenSigLine ?? storeMZpage.showGenSigLines,
    showRecombLine: config.showRecombLine ?? storeMZpage.showRecombLines,
    signal: config.signal, // The signal object with lead_variant, uuid, etc.
    // Add any other props your LZ2RegionPlot component needs
  }
})

// *** Event handlers **********************************************************
const onClick = (event) => {
  if (isMock.value) {
    emit('mock-click', { row: props.row, col: props.col, event })
  }
}

const onContextMenu = (event) => {
  if (isMock.value) {
    emit('mock-menu', { row: props.row, col: props.col, event })
  }
}

// *** Utility functions *******************************************************
function columnLabel(n) {
  let s = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    s = String.fromCharCode(65 + rem) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}
</script>

<style scoped>
.plot-cell {
  position: relative;
  background: white;
  overflow: hidden;
}

/* Mock plot styling */
.mock-plot {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(0, 0, 0, 0.2);
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.02),
    rgba(0, 0, 0, 0.02) 10px,
    rgba(0, 0, 0, 0.04) 10px,
    rgba(0, 0, 0, 0.04) 20px
  );
  cursor: pointer;
  transition: background 0.2s;
}

.mock-plot:hover {
  background: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.04),
    rgba(0, 0, 0, 0.04) 10px,
    rgba(0, 0, 0, 0.06) 10px,
    rgba(0, 0, 0, 0.06) 20px
  );
}

.mock-content {
  font-size: 1.5rem;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.3);
  user-select: none;
}
</style>
