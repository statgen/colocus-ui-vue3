<template>
  <v-sheet :id="props.id" class="bg-clcBackground px-2 mt-2" elevation="0" border>
    <div class="d-flex align-center">
      <ToolTippy>
        <v-icon icon="mdi-minus-circle-outline" @click="onResetButtonClick" class="reset-icon-class" />

        <template #tooltipContent>
          Reset to default values
        </template>
      </ToolTippy>
      <h2 class="mb-2 d-inline-flex">
        {{ title }}
      </h2>
    </div>
    <slot />
  </v-sheet>
</template>

<script setup>
import { provide, ref } from 'vue'

const props = defineProps(['title', 'resetButton', 'id'])

const resetInput = ref(false)
// const id = ref(props.id)

provide('resetInput', resetInput)

function onResetButtonClick() {
  resetInput.value = !resetInput.value
}
</script>

<style scoped>
</style>
