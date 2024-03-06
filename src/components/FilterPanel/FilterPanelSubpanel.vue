<template>
  <v-sheet color="clcBackground" elevation="0" border class="px-2 mt-2">
    <div class="d-flex align-center">
      <h2 class="mb-2 d-inline-flex">{{ title }}</h2>

<!--      text-blue-darken-1 deep-purple-lighten-1 aliceblue:#f0f8ff bg-red-lighten-5-->
      <v-spacer v-if="resetButton"></v-spacer>

<!--      <v-btn v-if="resetButton" @click="resetButtonClick" size="small" variant="tonal" color="clcAction">-->
<!--        Reset-->
<!--      </v-btn>-->

      <v-btn v-if="resetButton" @click="resetButtonClick" size="small" variant="plain" >
        <v-icon icon="mdi-close-circle" color="clcAction" size="24px"/>
        <v-tooltip activator="parent" location="start">
          Reset to default values
        </v-tooltip>
      </v-btn>

    </div>
    <slot />
  </v-sheet>
</template>

<script setup>
import { provide, ref } from 'vue';

const props = defineProps(['title', 'resetButton']);

const resetInput = ref(false)

provide('resetInput', resetInput)

function resetButtonClick() {
  resetInput.value = !resetInput.value
}
</script>

<style scoped>
</style>
