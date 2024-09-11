<template>
  <v-sheet class="bg-clcBackground px-2 mt-2" elevation="0" border>
    <div class="d-flex align-center">
        <ToolTippy>
          <h2 class="mb-2 d-inline-flex">
            <v-icon icon="mdi-minus-circle-outline" @click="onResetButtonClick" class="icon-class" />
            {{ title }}
          </h2>

          <template #tooltipContent>
            Reset to default values
          </template>
        </ToolTippy>
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
.icon-class {
  font-size: 24px;
  margin-top: 6px;
  margin-right: 4px;
  color: rgba(var(--v-theme-clcAction), 1.0);
}

</style>
