<template>
  <v-sheet :id="props.id" class="bg-clcBackground px-2 mt-2" elevation="0" border>
    <div class="d-flex align-center">
      <ToolTippy v-if="resetButton">
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
import { provide, ref} from 'vue'

const props = defineProps({
  id: '',
  title: '',
  resetButton:  { type: Boolean, default: false }
})

const resetInput = ref(false)

const resetButton = props.resetButton

provide('resetInput', resetInput)

function onResetButtonClick() {
  resetInput.value = !resetInput.value
}
</script>

<style scoped>
</style>
