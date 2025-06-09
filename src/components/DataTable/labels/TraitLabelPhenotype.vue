<template>
  <ToolTippy :isInteractive="true" @trigger="onTrigger">
    <span @click.stop class="text-no-wrap">
      {{ theUUID }}
    </span>
    <template #tooltipContent>
      <span>{{ theUUID }}: {{ thePhenotype }}</span>
    </template>
  </ToolTippy>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '@/stores/AppStore'
import { URLS } from '@/constants'
import { useFetchData } from '@/composables/fetchData'

const appStore = useAppStore()
const { data, errorMessage, fetchData } = useFetchData()

const props = defineProps({
  trait: Object,
})

const thePhenotype = computed(() => props?.trait?.phenotype?.name)
const theUUID = computed(() => props?.trait?.uuid)
const portalPheno = computed(() => props?.trait?.phenotype?.kp_id)

const aStyle = ref('')

const phenLink = ref(null)
const phenText = ref(`Checking ${theUUID.value}, please wait ...`)
const phenChecked = ref(false)

const onTrigger = async () => {
  if(!phenChecked.value) {
    const url = encodeURI(`${URLS.PORTAL_PHEN_CHECK}?q=${portalPheno.value}`)
    if(await fetchData(url, 'gene check', appStore.currentPageName)) {
      phenChecked.value = true
      const c = data?.value?.count
      if(c > 0) {
        const u = encodeURI(`${URLS.PORTAL_PHEN_PAGE}?phenotype=${portalPheno.value}`)
        phenLink.value = u
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
