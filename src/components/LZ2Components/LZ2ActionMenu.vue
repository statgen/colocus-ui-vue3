<template>
  <div class="plot-action-menu" :style="menuStyle" v-click-outside="() => $emit('close')">
    <ul>
      <li @click="$emit('delete')">🗑 Delete Plot</li>

      <li @click="$emit('toggle-recomb')">
        <label>
          <input type="checkbox" checked readonly />
          Show Recomb
        </label>
      </li>

      <li @click="$emit('toggle-gen-sig')">
        <label>
          <input type="checkbox" checked readonly />
          Show GenSig
        </label>
      </li>

      <li @click="$emit('export')">⬇ Export PNG</li>
    </ul>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

defineProps({
  menuStyle: Object // or use `top/left` numeric props if preferred
})

const emit = defineEmits([
  'delete',
  'toggle-recomb',
  'toggle-gen-sig',
  'export',
  'close'
])

function onKeydown(event) {
  if (event.key === 'Escape') {
    emit('close')
  }
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
