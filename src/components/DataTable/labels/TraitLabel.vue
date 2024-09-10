<template>
  <div class="d-inline">
    <span v-if="theBiomarkerType === BIOMARKER_TYPES.PHENOTYPE">
      <span v-if="theAbbrev">
        <ToolTippy :isInteractive="isInteractive">
          <span class="trait-highlight">{{ theUUID }}</span>
          <template #tooltipContent>
            {{ thePhenotype }}
          </template>
        </ToolTippy>
      </span>
      <span v-else :class="highlight ? 'text-indigo-darken-4' : '' ">
        {{ thePhenotype }}
      </span>
    </span>

    <span v-else-if="theGene">
      <span v-if="abbrev">
        <ToolTippy :isInteractive="isInteractive" @trigger="onTrigger">
          <v-icon icon="mdi-information-outline" class="text-clcAction mb-1" size="1.2rem"/>
          {{ middleTrim(theGene, 6, 6) }}
          <template #tooltipContent>
            <div @click.stop>
              {{ theGene }}
              <br />
              <a :href="geneLink" target="_blank" :class="aStyle">{{ geneLinkText }}</a>
            </div>
          </template>
        </ToolTippy>
      </span>
      <span v-else>
        {{ theGene }}
      </span>
    </span>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useFetchData } from '@/composables/fetchData'
import { BIOMARKER_TYPES, URLS } from '@/constants'
import { middleTrim } from '@/util/util'
import { useAppStore } from '@/stores/AppStore'

const { data, errorMessage, fetchData } = useFetchData()
const appStore = useAppStore()

const props = defineProps({
  trait: Object,
  abbrev: Boolean,
  highlight: Boolean,
  isInteractive: Boolean,
})

const aStyle = ref('')

const theAbbrev = computed(() => props?.abbrev)
const theBiomarkerType = computed(() => props?.trait?.biomarker_type)
const theGene = computed(() => props?.trait?.gene?.symbol)
const thePhenotype = computed(() => props?.trait?.phenotype?.name)
const theUUID = computed(() => props?.trait?.uuid)

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
        aStyle.value = 'a-style'
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
.a-style {
  border-bottom: 1px rgba(var(--v-theme-clcAction), 1.0) dashed;
  color: rgba(var(--v-theme-clcAction), 1.0);
  text-decoration: none;
}

.trait-highlight {
  border-bottom: 1px rgba(var(--v-theme-clcAction), 1.0) dashed;
  color: rgba(var(--v-theme-clcAction), 1.0);
}

</style>
