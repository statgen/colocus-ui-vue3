<template>
  <div class="d-flex align-center">
    <img 
      v-if="showLogo"
      alt="Project Logo" 
      src="../../assets/project_logo.png" 
      height="36"
      @error="showLogo = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showLogo = ref(true)
</script>