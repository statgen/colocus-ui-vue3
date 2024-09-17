<template>
  <ToolTippy :isInteractive="true" @trigger="onTrigger">
    <span class="text-no-wrap" :style="variantStyle">
      <v-icon v-if="showSplotch" icon="mdi-square" size="x-small" class="mb-1"/>
      {{ formatVariantString(theVariant, 20) }}
      <v-icon v-if="showClose" icon="mdi-close-circle" class="text-clcAction mb-1" size="1rem" @click="onIconClick"/>
    </span>
    <template #tooltipContent>
      <div @click.stop>
        <h3>{{ formatVariantString(theVariant) }}</h3>
        <a :href="variantLink" target="_blank" :class="aStyle">{{ variantLinkText}}</a>
      </div>
    </template>
  </ToolTippy>
</template>

<script setup>
import { computed, ref } from 'vue'
import { colorHasher, formatVariantString } from '@/util/util'
import { useAppStore } from '@/stores/AppStore'
import { URLS } from '@/constants'
import { useFetchData } from '@/composables/fetchData'

const appStore = useAppStore()
const cpn = appStore.currentPageName

const { data, errorMessage, fetchData } = useFetchData()

const variantStyle = computed(() => {
  return { color: appStore[cpn].colorCodeVariants ? colorHasher.hex(theVariant.value) : 'rgba(var(--v-theme-clcAction), 1.0)' }
})

const emit = defineEmits(['onClose'])

const props = defineProps({
  variant: String,
  showSplotch: { type: Boolean, default: false },
  showClose: { type: Boolean, default: false },
  marginLeft: { type: Number, default: 0 },
})

const theVariant = computed(() => props?.variant)

const variantQueryString = computed(() => {
  let s = theVariant.value
  s = s.replace(/_/g, ':')
  return s
})

const onIconClick = () => {
  emit('onClose')
}

const aStyle = ref('')

const variantLink = ref(null)
const variantLinkText = computed(() => {
  return variantText.value
})
const variantText = ref(`Checking ${theVariant.value}, please wait ...`)
const variantChecked = ref(false)

const onTrigger = async () => {
  if(!variantChecked.value) {
    const url = encodeURI(`${URLS.PORTAL_VAR_CHECK}?q=${variantQueryString.value}`)
    if(await fetchData(url, 'variant check', appStore.currentPageName)) {
      variantChecked.value = true
      if(data?.value?.count > 0) {
        const u = encodeURI(`${URLS.PORTAL_VAR_PAGE}?variant=${variantQueryString.value}`)
        variantLink.value = u
        variantText.value = `View ${ theVariant.value } in CMDKP portal`
        aStyle.value = 'coLink'
      } else {
        variantText.value = `Unknown variant: ${ theVariant.value }`
      }
    } else {
      console.error(`Error checking variant: ${ theVariant.value } on portal:`, errorMessage)
    }
  }
}

</script>

<style scoped>
</style>
