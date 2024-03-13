import { reactive, toRefs } from 'vue'

export const useFetchData = () => {
  const state = reactive({
    data: null,
    isLoading: false,
    hasError: false,
    errorMessage: '',
  })

  const fetchData = async (url, options) => {
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
  }

  return {
    ...toRefs(state), fetchData
  }
}

export default useFetchData()
