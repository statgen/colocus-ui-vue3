<template>
  <div class="plot-action-menu" :style="menuStyle" v-click-outside="onCloseMenu">
    <ul>
      <template v-for="item in visibleMenuItems" :key="item.id">
        <li v-if="item.type === 'checkbox'">
          <label>
            <input
              type="checkbox"
              :checked="item.checked?.get()"
              @change="handleCheckboxChange(item, $event.target.checked)"
            />
            {{ item.label }}
          </label>
        </li>

        <li v-else-if="item.type === 'action'" @click.self="handleAction(item)">
          {{ item.icon ? item.icon + ' ' : '' }}{{ item.label }}
        </li>

        <li v-else-if="item.type === 'divider'" class="menu-divider"></li>
      </template>
    </ul>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { getMenuItems } from './ActionMenuConfig'

const props = defineProps({
  menuStyle: {},
  menuType: '',
  context: {},
})

const emit = defineEmits([
  'delete-plot',
  'export-plot',
  'close-menu',
  'copy-data',
  'sort-column',
  'hide-column',
  'freeze-column',
  'filter-data'
])

const visibleMenuItems = computed(() => {
  return getMenuItems(props.menuType)
})

const handleCheckboxChange = (item, checked) => {
  if (item.checked?.set) {
    item.checked.set(checked, emit)
  }
}

const handleAction = (item) => {
  if (item.event) {
    const eventData = item.data !== undefined ? item.data : props.context
    emit(item.event, eventData)
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})

const onCloseMenu = () => {
  emit('close-menu')
}

const onKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close-menu')
  }
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

.plot-action-menu li.menu-divider {
  height: 1px;
  background-color: rgba(var(--v-theme-clcTooltipBorder), 0.5);
  margin: 4px 0;
  padding: 0;
  cursor: default;
}

.plot-action-menu li.menu-divider:hover {
  background-color: rgba(var(--v-theme-clcTooltipBorder), 0.5);
}

.plot-action-menu input[type="checkbox"] {
  pointer-events: auto;
}
</style>
