<template>
  <span class="text-no-wrap" :style="{color: colorHasher.hex(variant), marginLeft: marginLeft + 'px'}">
    <v-icon v-if="showSplotch" icon="mdi-square" size="x-small" class="mb-1"/>
    {{ formatVariantString(variant, 20) }}
    <v-icon v-if="showClose" icon="mdi-close-circle" class="text-clcAction mb-1" size="1rem" @click="onIconClick"/>
  </span>
  <v-tooltip activator="parent" location="top">
    {{ formatVariantString(variant) }}
  </v-tooltip>
</template>

<script setup>
import { colorHasher, formatVariantString } from '@/util/util'

const emit = defineEmits(['onClose'])

const props = defineProps({
  variant: String,
  showSplotch: { type: Boolean, default: false },
  showClose: { type: Boolean, default: false },
  marginLeft: { type: Number, default: 0 },
})

const onIconClick = () => {
  emit('onClose')
}
</script>

<style scoped>
</style>
