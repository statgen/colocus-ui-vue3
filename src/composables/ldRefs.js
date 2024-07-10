import { computed, ref, watch } from 'vue'
import { sortVariantArray } from '@/util/util'
import { useFilterStore } from '@/stores/FilterStore'

const filterStore = useFilterStore()

export function useLDRefs() {
  const refList = ref([])

  watch(refList, (newList) => {
    filterStore.ldRefs = getUniques(newList)
  }, { deep: true })

  const getUniques = (newList) => {
    const variantSet = [...new Set(newList.map(ref => ref.variantID))]
    let a = Array.from(variantSet)
    a = sortVariantArray(a)
    return a
  }

  const addRef = (ref) => {
    refList.value.push(ref)
  }

  const removePanelRef = (removeRef) => {
    const index = refList.value.findIndex(ref => removeRef.data === ref.panelID)
    if (index !== -1) {
      refList.value.splice(index, 1)
    }
  }

  const signalExists = (signal) => {
    return refList.value.some(ref => ref.signalID === signal)
  }

  const panelExists = (panel) => {
    return refList.value.some(ref => ref.panelID === panel)
  }

  const variantExists = (variant) => {
    return refList.value.some(ref => ref.variantID === variant)
  }

  return {
    refList,
    addRef,
    removePanelRef,
    signalExists,
    panelExists,
    variantExists,
  }
}
