<template>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'

const props = defineProps({
  buildSteps: Function,
})

const tour = ref(null)

function initTour() {
  tour.value = new Shepherd.Tour({
    defaultStepOptions: {
      cancelIcon: { enabled: true },
      scrollTo: { behavior: 'smooth', block: 'center' },
      classes: 'shepherd-theme-arrows',
    },
    useModalOverlay: true,
  })

  const steps = props.buildSteps(tour.value)
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
