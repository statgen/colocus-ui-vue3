<template>
  <ToolTippy>
    <v-icon icon="mdi-information-outline" @click="onClick" class="info-icon-class" />
    <template #tooltipContent>
      View tutorial on page operation
    </template>
  </ToolTippy>
</template>

<script setup>
import { ref } from 'vue'
import Shepherd from 'shepherd.js'
import 'shepherd.js/dist/css/shepherd.css'
import { useAppStore } from '@/stores/AppStore'
import { scrollTop } from '@/util/util'

const appStore = useAppStore()

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

async function waitForElement(selector, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const interval = 50;
    let elapsed = 0;
    const check = () => {
      const el = document.querySelector(selector)
      if (el) return resolve(el)
      elapsed += interval
      if (elapsed >= timeout) return reject('Element not found: ' + selector)
      setTimeout(check, interval)
    }
    check()
  })
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
    endTour()
  })

  tour.value.on('cancel', () => {
    endTour()
  })
}

const onClick = () => {
  appStore.tutorialFlag = !appStore.tutorialFlag
  startTour()
}

const endTour = () => {
  appStore.dataTable.expandedRow.length = 0
  scrollTop()
}

const startTour = () => {
    if (!tour.value) initTour()
    tour.value.start()
}

</script>
<style scoped>
</style>
