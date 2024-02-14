<template>
  <div class="ml-2 mb-n4 pa-0">
    <v-switch
      :label="propSet.title"
      @update:model-value="modelChanged"
      density="compact"
    />
  </div>
</template>

<script setup>
import { useFilterStore } from '@/stores/FilterStore';

const store = useFilterStore();

const { propSet } = defineProps({
  propSet: {}
})

const modelChanged = (newValue) => {
  store.updateFilters({ [propSet.storeKey]: newValue })
}

</script>

<style scoped>

</style>
