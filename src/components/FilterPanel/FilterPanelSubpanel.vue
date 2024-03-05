<template>
  <v-sheet color="grey-lighten-4" elevation="0" border class="px-2 mt-2">
    <div class="d-flex align-center">
      <h2 class="panel-title mb-2">{{ title }}</h2>

<!--      text-blue-darken-1 deep-purple-lighten-1-->
      <v-spacer v-if="resetButton"></v-spacer>
<!--      bg-red-lighten-5-->
      <v-btn v-if="resetButton" @click="resetButtonClick" size="small" variant="tonal" color="blue-accent-4" class="btn">
        Reset
      </v-btn>

<!--      <v-btn v-if="resetButton" @click="resetButtonClick" size="small" variant="tonal" color="teal-accent-4" class="btn bg-transparent">-->
<!--        <v-icon icon="mdi-restore" @click="resetButtonClick" class="text-teal-accent-4 bg-transparent" size="28px"/>-->
<!--        <v-tooltip activator="parent" location="start">-->
<!--          Reset to default values-->
<!--        </v-tooltip>-->
<!--      </v-btn>-->

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
.panel-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.btn {
  display: inline-flex;
}

h2 {
  display: inline-flex;
  color: #FB8C00;
}

</style>
