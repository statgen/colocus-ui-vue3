<template>
  <Tippy theme="tippy-theme" :arrow="true" :interactive="isInteractive" :key="isInteractive" :hide-on-click="true">
    <template #default>
      <slot />
    </template>
    <template #content>
      <slot name="tooltipContent"/>
    </template>
  </Tippy>
</template>

<script setup>
import { Tippy } from 'vue-tippy'

const props = defineProps({
  isInteractive: { type: Boolean, default: false },
})

</script>

<style scoped>
</style>
