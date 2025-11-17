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

        <li v-else-if="item.type === 'input'">
          <label>{{ item.icon }} {{ item.label }}
            <input v-model="inputValues[item.id]" type="text" maxlength="5" size="5" style="background-color: #fbfbfb" class="ml-2"/>
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
import { computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import { getMenuItems } from './ActionMenuConfig'

const props = defineProps({
  menuStyle: {},
  menuType: '',
  context: {},
})

const inputValues = reactive({})

const emit = defineEmits([
  'add-plot-insert',
  'add-plot-replace',
  'close-menu',
  'copy-data',
  'delete-plot',
  'export-plot',
  'filter-data',
  'freeze-column',
  'hide-column',
  'move-plot-insert',
  'move-plot-replace',
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
  width: 300px;
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
