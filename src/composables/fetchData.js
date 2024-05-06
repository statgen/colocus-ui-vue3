import { reactive, toRefs } from 'vue'
import { ppURL } from '@/util/util'

export const useFetchData = () => {
  const state = reactive({
    data: null,
    isLoading: false,
    hasError: false,
    errorMessage: '',
  })

  const fetchData = async (url, reason, page, options) => {
    // const prettyPrint = true
    // console.log(`fetching ${reason} for ${page} page from:\n`, prettyPrint ? ppURL(url.href) : url.href)
    state.isLoading = true
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      state.data = await response.json()
    } catch (error) {
      state.hasError = true
      state.errorMessage = error.message
    } finally {
      state.isLoading = false
    }
    return !state.hasError
  }

  return {
    ...toRefs(state), fetchData
  }
}
