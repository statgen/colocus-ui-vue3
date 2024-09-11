<template>
  <ToolTippy :isInteractive="true" @trigger="onTrigger">
    <span class="text-clcAction" @click.stop="onClick">{{ theUUID }}</span>
    <template #tooltipContent>
      <h3>{{ theUUID }}: {{ thePhenotype }}</h3>
      <span class="coLink" @click.stop="onClick">View local Manhattan plot</span>
      <br />
      <a :href="phenLink" target="_blank" :class="aStyle">{{ phenLinkText }}</a>
    </template>
  </ToolTippy>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { PAGE_NAMES, URLS } from '@/constants'
import router from '@/router'
import { useFetchData } from '@/composables/fetchData'

const appStore = useAppStore()
const { data, errorMessage, fetchData } = useFetchData()

const manhattanPage = PAGE_NAMES.MANHATTAN

const props = defineProps({
  analysisID: String,
  trait: Object,
})

const thePhenotype = computed(() => props?.trait?.phenotype?.name)
const theUUID = computed(() => props?.trait?.uuid)

const aStyle = ref('')

const phenLink = ref(null)
const phenText = ref(`Checking ${theUUID.value}, please wait ...`)
const phenLinkText = computed(() => {
  return phenText.value
})
const phenChecked = ref(false)

const onClick = () => {
  appStore.setPageKey(manhattanPage, 'analysisID', props.analysisID)
  const cpn = appStore.currentPageName
  if(cpn === manhattanPage) {
    appStore[manhattanPage].loadManhattanDataFlag = !appStore[manhattanPage].loadManhattanDataFlag
  } else {
    router.push({name: manhattanPage})
  }
}

const onTrigger = async () => {
  if(!phenChecked.value) {
    const url = encodeURI(`${URLS.PORTAL_PHEN_CHECK}?q=${theUUID.value}`)
    console.log('phen check url:', url)
    if(await fetchData(url, 'gene check', appStore.currentPageName)) {
      phenChecked.value = true
      const c = data?.value?.count
      // console.log('count:', c)
      if(c > 0) {
        const u = encodeURI(`${URLS.PORTAL_PHEN_PAGE}?phenotype=${theUUID.value}`)
        // console.log('phen page url:', u)
        phenLink.value = u
        phenText.value = `View ${ theUUID.value } in CMDKP portal`
        aStyle.value = 'coLink'
      } else {
        aStyle.value = ''
        phenText.value = `Unknown phenotype: ${ theUUID.value }`
      }
    } else {
      console.error(`Error checking phenotype: ${ thePhenotype.value } on portal:`, errorMessage)
    }
  }
}

</script>

<style scoped>
</style>
