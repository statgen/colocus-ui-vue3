<template>
  <div
    :id="id"
    :style="{ gridRow: row + 1, gridColumn: col + 1 }"
  >
    <div ref="mountEl"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, ref, watchEffect, render, cloneVNode } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES } from '@/constants'

const appStore = useAppStore()
const storeMZpage = appStore[PAGE_NAMES.MULTIZOOM]

const props = defineProps({
  cell:   { type: String, required: true },          // "r,c"
  plotID: { type: [String, Number], required: true } // 1 or "1"
})

const mountEl = ref(null)

const row = computed(() => Number(props.cell.split(',')[0]))
const col = computed(() => Number(props.cell.split(',')[1]))
const id  = computed(() => `cell_${props.cell}`)

// Keep track of what we last mounted (so we can unmount cleanly)
let lastMountedEl = null

function doMount() {
  const el = mountEl.value
  if (!el) return

  const key = String(props.plotID)
  const entry = storeMZpage.plotRegistry?.[key]
  if (!entry || !entry.vnode) {
    // nothing to show yet
    render(null, el)
    return
  }

  // If this vnode was previously mounted elsewhere, unmount it there
  if (entry.mountEl && entry.mountEl !== el) {
    try { render(null, entry.mountEl) } catch (_) {}
  }

  // Clear whatever is in our target, then mount a *clone* of the vnode
  render(null, el)
  const vnode = cloneVNode(entry.vnode)   // fresh identity, safe to mount here
  render(vnode, el)

  entry.mountEl = el
  lastMountedEl = el
}

onMounted(doMount)

// Re-run whenever: mount target exists, plotID changes, or registry entry changes
watchEffect(() => {
  // read as dependencies
  void mountEl.value
  const key = String(props.plotID)
  void storeMZpage.plotRegistry?.[key]
  doMount()
})

onBeforeUnmount(() => {
  if (lastMountedEl) {
    try { render(null, lastMountedEl) } catch (_) {}
  }
})

</script>


<style scoped>
</style>
