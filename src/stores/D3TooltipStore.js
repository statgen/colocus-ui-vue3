import { defineStore } from 'pinia'
import { markRaw, ref, reactive } from 'vue'

export const useD3TooltipStore = defineStore('D3tooltip', () => {
  const isVisible = ref(false)
  const position = reactive({ x: 0, y: 0 })
  const content = ref(null)
  const targetElement = ref(null)

  const showTooltip = (data, event) => {
    content.value = markRaw(data)
    position.x = event.clientX
    position.y = event.clientY
    targetElement.value = event.target
    isVisible.value = true
  }

  const hideTooltip = () => {
    isVisible.value = false
    content.value = null
    targetElement.value = null
  }

  const updatePosition = (event) => {
    if (isVisible.value) {
      position.x = event.clientX
      position.y = event.clientY
    }
  }

  return {
    isVisible,
    position,
    content,
    targetElement,
    showTooltip,
    hideTooltip,
    updatePosition
  }
})
