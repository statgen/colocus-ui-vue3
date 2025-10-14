<template>
  <div
    @click.stop="onMockClick(cell, $event)"
    @contextmenu.prevent.stop="onMockMenu(cell, $event)"
    :id="id"
    :style="{ gridRow: row + 1, gridColumn: col + 1 }"
    class="mock-plot"
  >
    {{ label }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMZGridHelpers } from '@/composables/mzGridHelpers'

const mzGridHelpers = useMZGridHelpers()

const props = defineProps({
  cell: String,
})

const [r, c] = computed(() => props.cell.split(',')).value
const row = Number(r)
const col = Number(c)
const id = computed(() => `cell_${props.cell}`)
const label = computed(() => `${r}${mzGridHelpers.columnLabel(c)}` )

const onMockClick = (label, $event) => { console.log('mock click', label, $event) }
const onMockMenu  = (label, $event) => { console.log('mock menu', label, $event) }
</script>

<style scoped>
.mock-plot {
  background: #fff;
  border: 1px dashed rgba(0,0,0,.2);
  box-sizing: border-box;
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  height: 100%;
  width: 100%;
}
</style>
