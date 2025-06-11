<template>
  <span v-if="!hasTitle">
    Loading ...
  </span>
  <span v-else>
    <ToolTippy>
      <a @click.prevent=scrollToHeading(linkID) class="coLink mb-1 text-no-wrap d-block">{{ truncateString(computedTitle, MAX_PLOT_TITLE_LEN) }}</a>
      <template #tooltipContent>{{ computedTitle }}</template>
    </ToolTippy>
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useQCStore } from '@/stores/QCStore'
import { scrollToHeading, truncateString } from '@/util/util'

const qcStore = useQCStore()

const props = defineProps({
  config: Object,
})

const MAX_PLOT_TITLE_LEN = 38

const id = ref(props.config.plotID)
const linkID = ref(`PlotHeading${id.value}`)
const title = ref('asdf')

watch(() => qcStore.selectedStudyName, (newVal, oldVal) => {
  title.value = `Plot ${id.value}: ${props.config.plotTitle}`.replace('%s', newVal)
})

const computedTitle = computed(() => {
  return `Plot ${id.value}: ${props.config.plotTitle}`.replace('%s', qcStore.selectedStudyName)
})

const hasTitle = computed(() => !!computedTitle)

</script>

<style scoped>
a {
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
