<template>
  <div class="d-flex" style="transition: all 0.3s ease;">
    <!-- Sidebar -->
    <transition name="sidebar-slide-fade">
      <div
        v-show="appStore.isSidebarShowing"
        :style="{
          flexBasis: `${SIDEBAR_WIDTH}px`,
          flexShrink: 0,
          transition: 'all 0.3s ease',
          maxWidth: `${SIDEBAR_WIDTH}px`,
          width: `${SIDEBAR_WIDTH}px`
        }"
      >
        <slot name="sidebar" />
      </div>
    </transition>

    <!-- Main content -->
    <div class="flex-grow-1 ml-2 content-scroll" style="transition: all 0.3s ease;">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { SIDEBAR_WIDTH } from '@/constants'
import { useAppStore } from '@/stores/AppStore'
const appStore = useAppStore()
</script>

<style scoped>
/* vue automatically injects these based on the transition name above */
.sidebar-slide-fade-enter-active,
.sidebar-slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.sidebar-slide-fade-enter-from,
.sidebar-slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.content-scroll {
  overflow-x: auto;
  overflow-y: auto;
}
</style>
