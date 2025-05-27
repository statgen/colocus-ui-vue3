<template>
  <v-btn
    @click="onClick"
    color="clcAction"
    density="comfortable"
    size="small"
    variant="outlined"
  >{{ title }}</v-btn>
</template>

<script setup>
const { title } = defineProps({
  title: '',
})

const emit = defineEmits(['onClick'])

const onClick = () => {
  emit('onClick')
}

</script>

<style scoped>
</style>
