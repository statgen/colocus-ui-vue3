<template>
  <div v-show="show" class="busy-overlay" role="status" aria-live="polite">
    <div class="spinner" aria-label="Working…"></div>
  </div>
</template>

<script setup>
defineProps({ show: { type: Boolean, default: false } })
</script>

<style scoped>
.busy-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.32);
  display: flex; align-items: center; justify-content: center;
}
.spinner {
  width: 44px; height: 44px;
  border: 4px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
