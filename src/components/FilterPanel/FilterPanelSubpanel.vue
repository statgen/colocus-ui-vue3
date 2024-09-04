<template>
  <v-sheet class="bg-clcBackground px-2 mt-2" elevation="0" border>
    <div class="d-flex align-center">
      <h2 class="mb-2 d-inline-flex">{{ title }}</h2>

      <v-spacer v-if="resetButton"></v-spacer>

      <v-btn v-if="resetButton" @click="onResetButtonClick" size="small" variant="plain" >
        <ToolTippy>
          <v-icon icon="mdi-close-circle" class="text-clcAction" size="24px"/>
          <template #tooltipContent>
            Reset to default values
          </template>
        </ToolTippy>
      </v-btn>

    </div>
    <slot />
  </v-sheet>
</template>

<script setup>
import { provide, ref } from 'vue'

const props = defineProps(['title', 'resetButton'])

const resetInput = ref(false)

provide('resetInput', resetInput)

function onResetButtonClick() {
  resetInput.value = !resetInput.value
}
</script>

<style scoped>
</style>
