<template>
  <div @click.stop="onClick" class="plot-num clcAction">{{ plotID }}</div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/AppStore'

const props = defineProps({
  rowKey: String,
  slot: String,
  title: String,
})

const appStore = useAppStore()
const plotID = computed(() => props.title || appStore.getPlotID(props.rowKey, props.slot))

const emit = defineEmits(['on-toggle-plot'])

const onClick = () => {
  emit('on-toggle-plot')
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
