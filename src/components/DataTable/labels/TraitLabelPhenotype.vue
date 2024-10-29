<template>
  <ToolTippy :isInteractive="true" @trigger="onTrigger">
    <span @click.stop class="text-no-wrap">
      {{ theUUID }}
      <v-icon icon="mdi-star-four-points" size="1rem" class="text-clcAction"/>
    </span>
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
const portalPheno = computed(() => props?.trait?.phenotype?.kp_id)

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
    loadManhattanData()
  } else {
    router.push({name: manhattanPage})
  }
}

const loadManhattanData = () => {
  appStore[manhattanPage].loadManhattanDataFlag = !appStore[manhattanPage].loadManhattanDataFlag
}

const onTrigger = async () => {
  if(!phenChecked.value) {
    const url = encodeURI(`${URLS.PORTAL_PHEN_CHECK}?q=${portalPheno.value}`)
    // console.log('phen check url:', url)
    if(await fetchData(url, 'gene check', appStore.currentPageName)) {
      phenChecked.value = true
      const c = data?.value?.count
      // console.log('count:', c)
      if(c > 0) {
        const u = encodeURI(`${URLS.PORTAL_PHEN_PAGE}?phenotype=${portalPheno.value}`)
        // console.log('phen page url:', u)
        phenLink.value = u
        // RPW: keeping this to our phenotype ID/UUID so that it matches the table, I think someone might be confused
        // that the phenotype changed name in the tooltip if we show the portal phenotype ID (and it's just a technical
        // detail)
        phenText.value = `View ${ theUUID.value } in CMDKP portal`
        aStyle.value = 'coLink'
      } else {
        aStyle.value = ''
        phenLink.value = "https://hugeamp.org/"
        phenText.value = `${ theUUID.value } does not exist in CMDKP portal`
      }
    } else {
      console.error(`Error checking phenotype: ${ thePhenotype.value } on portal:`, errorMessage)
    }
  }
}

</script>

<style scoped>
</style>
