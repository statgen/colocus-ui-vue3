<template>
  <a v-if="link" :href="link" target="_blank" :class="linkClass">{{ linkText }}</a>
  <span v-else :class="linkClass">{{ linkText }}</span>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useFetchData } from '@/composables/fetchData'
import { useAppStore } from '@/stores/AppStore'

const appStore = useAppStore()

const { data, errorMessage, fetchData } = useFetchData()

const props = defineProps({
  args: Object
})

const { checkName, checkURL, pageURL, shortName, traitType } = props.args

const link = ref(null)
const linkText = ref(`Checking ${shortName} ...`)
const linkClass = ref('')

onMounted(async () => {
  if(!checkName) {
    linkText.value = `Missing check element for ${ shortName }`
    linkClass.value = 'text-red'
    return
  }

  const url = encodeURI(`${checkURL}?q=${checkName}`)
  if(await fetchData(url, 'trait check', appStore.currentPageName)) {
    const c = data?.value?.count
    if(c > 0) {
      link.value = encodeURI(`${pageURL}?${traitType}=${checkName}`)
      linkText.value = `${ shortName }`
      linkClass.value = 'coLink'
    }
  } else {
    console.error(`Error checking trait: ${ longName } on portal:`, errorMessage)
  }
})
</script>

<style scoped>
</style>
