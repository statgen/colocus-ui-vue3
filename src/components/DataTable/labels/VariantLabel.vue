<template>
  <div class="nowrap">
    <span :style="{color: variantColor}">
      <v-icon icon="mdi-square" size="x-small" class="mr-1"/>
      {{ formatVariant(variant, 20) }}
    </span>
    <v-tooltip activator="parent" location="top">
      {{ formatVariant(variant) }}
    </v-tooltip>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { colorHasher } from '@/util/util'

const props = defineProps({
  variant: String,
})

const variantColor = computed(() => colorHasher.hex(props.variant))

const formatVariant = ((variant, truncateLength = 0) => {
  const components = variant.split('_')

  components[1] = parseInt(components[1]).toLocaleString()

  let formattedVariant = components.join('_')

  if (truncateLength) {
    if (formattedVariant.length > truncateLength) {
      formattedVariant = `${formattedVariant.slice(0, truncateLength - 3)}...`
    }
  }
  return formattedVariant
})

</script>

<style scoped>
.nowrap {
  white-space: nowrap;
}
</style>
