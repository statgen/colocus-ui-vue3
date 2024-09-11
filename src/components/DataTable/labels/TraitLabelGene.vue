<template>
        <ToolTippy :isInteractive="true" @trigger="onTrigger">
<!--          <v-icon icon="mdi-information-outline" class="text-clcAction mb-1" size="1.2rem"/>-->
          <span class="text-clcAction">{{ middleTrim(theGene, 6, 6) }}</span>
          <template #tooltipContent>
            <div @click.stop>
              <h3>{{ theGene }}</h3>
              <a :href="geneLink" target="_blank" :class="aStyle">{{ geneLinkText }}</a>
            </div>
          </template>
        </ToolTippy>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useFetchData } from '@/composables/fetchData'
import { URLS } from '@/constants'
import { middleTrim } from '@/util/util'
import { useAppStore } from '@/stores/AppStore'

const { data, errorMessage, fetchData } = useFetchData()
const appStore = useAppStore()

const props = defineProps({
  trait: Object,
})

const aStyle = ref('')

const theGene = computed(() => props?.trait?.gene?.symbol)

const geneLink = ref(null)
const geneText = ref(`Checking ${theGene.value}, please wait ...`)
const geneLinkText = computed(() => {
  return geneText.value
})
const geneChecked = ref(false)

const onTrigger = async () => {
  if(!geneChecked.value) {
    const url = encodeURI(`${URLS.PORTAL_GENE_CHECK}?q=${theGene.value}`)
    // console.log('gene check url:', url)
    if(await fetchData(url, 'gene check', appStore.currentPageName)) {
      geneChecked.value = true
      if(data?.value?.count > 0) {
        const u = encodeURI(`${URLS.PORTAL_GENE_PAGE}?gene=${theGene.value}`)
        // console.log('gene page url:', u)
        geneLink.value = u
        geneText.value = `View ${ theGene.value } in CMDKP portal`
        aStyle.value = 'coLink'
      } else {
        geneText.value = `Unknown gene: ${ theGene.value }`
      }
    } else {
      console.error(`Error checking gene: ${ theGene.value } on portal:`, errorMessage)
    }
  }
}

</script>
<style scoped>
</style>
