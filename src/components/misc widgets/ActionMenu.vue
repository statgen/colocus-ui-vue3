<template>
  <div ref="menuRef" class="plot-action-menu" :style="menuStyle" v-click-outside="onCloseMenu">
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

        <li v-else-if="item.type === 'input'">
          <label>{{ item.icon }} {{ item.label }}
            <input v-model="inputValues[item.id]" type="text" maxlength="5" size="5" style="background-color: #fbfbfb" class="ml-1 pl-1"/>
            <v-btn
              @click="onInputBtnClick(item, inputValues[item.id])" variant="tonal" size="x-small" class="ml-2 text-clcAction">
              🔘
            </v-btn>
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
import {computed, onMounted, nextTick, onBeforeUnmount, reactive, ref } from 'vue'
import { getMenuItems } from './ActionMenuConfig'
import { MZ_GRID_DISPLAY_OPTIONS } from '@/constants'

const props = defineProps({
  menuStyle: {},
  menuType: '',
  context: {},
})

const inputValues = reactive({})
const menuRef = ref(null)

const emit = defineEmits([
  'add-plot-insert',
  'add-plot-replace',
  'close-menu',
  'copy-data',
  'delete-cell',
  'delete-column',
  'delete-plot',
  'delete-row',
  'export-plot',
  'filter-data',
  'freeze-column',
  'hide-column',
  'insert-column',
  'insert-row',
  'move-column-insert',
  'move-column-replace',
  'move-plot-insert',
  'move-plot-replace',
  'move-row-insert',
  'move-row-replace',
  'sort-column',
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
  const eventData = item.data !== undefined ? item.data : props.context
  emit(item.event, eventData)
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  ensureMenuVisible()
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

const onInputBtnClick = (item, value) => {
//  console.log('Button clicked for item:', item.id, 'with value:', value, 'with event:', item.event)
  emit(item.event, {
    ...props.context,
    inputValue: value,
    itemId: item.id
  })
}

const ensureMenuVisible = () => {
  if (!menuRef.value) return

  nextTick(() => {
    const menuRect = menuRef.value.getBoundingClientRect()
    const padding = 10 // Extra padding from viewport edges

    // Calculate how much to scroll
    let scrollX = 0
    let scrollY = 0

    // Check if menu extends beyond right edge
    if (menuRect.right > window.innerWidth - padding) {
      scrollX = menuRect.right - window.innerWidth + padding
    }

    // Check if menu extends beyond left edge (shouldn't happen but just in case)
    if (menuRect.left < padding) {
      scrollX = menuRect.left - padding
    }

    // Check if menu extends beyond bottom edge
    if (menuRect.bottom > window.innerHeight - padding) {
      scrollY = menuRect.bottom - window.innerHeight + padding
    }

    // Check if menu extends beyond top edge (shouldn't happen but just in case)
    if (menuRect.top < padding) {
      scrollY = menuRect.top - padding
    }

    // Scroll if needed
    if (scrollX !== 0 || scrollY !== 0) {
      window.scrollBy({
        left: scrollX,
        top: scrollY,
        behavior: 'smooth'
      })
    }
  })
}

</script>

<style scoped>
.plot-action-menu {
  position: absolute;
  background-color: rgba(var(--v-theme-clcTooltipBackground), 1.0);
  border: 1px solid rgba(var(--v-theme-clcTooltipBorder), 1.0);
  border-radius: 6px;
  z-index: 9999;
  padding: 4px 4px 8px 4px;
  min-width: 160px;
  font-size: 0.9rem;
  width: v-bind(MZ_GRID_DISPLAY_OPTIONS.actionMenuWidth + 'px');
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

.plot-action-menu input[type="checkbox"] {
  pointer-events: auto;
}
</style>
