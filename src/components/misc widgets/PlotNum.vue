<template>
  <div @click.stop="onClick" class="plot-num clcAction">{{ title }}</div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { useMZGridHelpers } from '@/composables/mzGridHelpers'
import { PAGE_NAMES } from '@/constants'

const mzGridHelpers = useMZGridHelpers()

const appStore = useAppStore()
const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]


const props = defineProps({
  rowKey: String,
  slot: String,
})

const plotID = computed(() => mzGridHelpers.getPlotIDfromRowSlot(props.rowKey, props.slot))

const title = computed(() => {
  const pm = storeMZpage.plotMoved // Force reactivity on plotMoved

  if (!plotID.value) return ''

  const cell = storeMZpage.plotRegistry[plotID.value]?.cell
  return cell ? mzGridHelpers.cellRClabel(cell) : ''
})

const emit = defineEmits(['on-plot-icon-click'])

const onClick = (event) => {
  const args = { plotID: plotID.value, slot: props.slot, event }
  emit('on-plot-icon-click', args)
}

</script>

<style scoped>
.plot-num {
  display: inline-flex;
  vertical-align: middle;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 22px;
  min-width: 22px;
  margin: 0 2px;
  padding: 0 4px;
  border: 2px solid rgba(var(--v-theme-clcAction), 1);
  font-size: 0.9rem;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
</style>
