<template>
  <ToolTippy :isInteractive="true" @trigger="onTrigger">
    <span class="text-no-wrap">
      {{ middleTrim(theGene, 6, 6) }}
    </span>
    <template #tooltipContent>
      <div @click.stop>
        <span>{{ theGene }}</span>
      </div>
    </template>
  </ToolTippy>
</template>

<script setup>
import { computed, ref } from 'vue'
import router from '@/router'
import { useFetchData } from '@/composables/fetchData'
import { PAGE_NAMES, URLS } from '@/constants'
import { middleTrim } from '@/util/util'
import { useAppStore } from '@/stores/AppStore'

const { data, errorMessage, fetchData } = useFetchData()
const appStore = useAppStore()

const genePage = PAGE_NAMES.GENE

const props = defineProps({
  trait: Object,
})

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
    if(await fetchData(url, 'gene check', appStore.currentPageName)) {
      geneChecked.value = true
      if(data?.value?.count > 0) {
        const u = encodeURI(`${URLS.PORTAL_GENE_PAGE}?gene=${theGene.value}`)
        geneLink.value = u
        geneText.value = `View ${ theGene.value } in CMDKP portal`
      } else {
        geneText.value = `Unknown gene: ${ theGene.value }`
      }
    } else {
      console.error(`Error checking gene: ${ theGene.value } on portal:`, errorMessage)
    }
  }
}

const onClick = () => {
  router.push({ name: genePage, query: { gene: theGene.value } })
}
</script>

<style scoped>
</style>
