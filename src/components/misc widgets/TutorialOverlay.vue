<template>
  <ToolTippy>
    <v-icon icon="mdi-information-outline" @click="start" class="info-icon-class" />
    <template #tooltipContent>
      View tutorial on page operation
    </template>
  </ToolTippy>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'

const props = defineProps({
  steps: Array,
})

const tour = ref(null)

const buildTourStepActions = (tour, steps) => {
  return steps.map(step => ({
    ...step,
    classes: 'custom-shepherd-offset', // see global.css for definition
    buttons: step.buttons.map(button => {
      if (typeof button.action === 'string') {
        switch (button.action) {
          case 'next':
            return { ...button, action: () => tour.next() }
          case 'back':
            return { ...button, action: () => tour.back() }
          case 'complete':
            return { ...button, action: () => tour.complete() }
          default:
            return button
        }
      }
      return button
    })
  }))
}

function initTour() {
  tour.value = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: { enabled: true },
      scrollTo: { behavior: 'smooth', block: 'center' },
      classes: 'shepherd-theme-arrows',
    },
    useModalOverlay: true,
  })

  const steps = buildTourStepActions(tour.value, props.steps)
  steps.forEach(step => tour.value.addStep(step))

  tour.value.on('complete', () => {
    scrollTop()
  })

  tour.value.on('cancel', () => {
    scrollTop()
  })

}

const scrollTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const start = () => {
    if (!tour.value) initTour()
    tour.value.start()
}

defineExpose({
  start,
})
</script>
