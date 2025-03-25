import { reactive, toRefs } from 'vue'
import { ppURL } from '@/util/util'

export const useFetchData = () => {
  const state = reactive({
    data: [],
    isLoading: false,
    hasError: false,
    errorMessage: '',
  })

  const fetchData = async (url, reason, page, options) => {
    const prettyPrint = true
    // console.log(`fetching ${reason} for ${page} page from:\n`, prettyPrint ? ppURL(url.href || url) : url.href || url)
    state.isLoading = true
    try {
      const results = []
      let response = await fetch(url, options)
      let json = null;

      while (response.ok) {
        json = await response.json()

        // If these are paginated results, add the results into a list and continue
        if (json.results) {
          results.push(...json.results);
        }

        // Note: if a specific page was asked for, we should not continue fetching more pages
        // Unfortunately `url` can be either a string, or a URL object
        if (
          url?.searchParams?.has?.('page') ||
          url?.search?.includes?.('page=') ||
          url?.includes?.('page=')
        ) {
          // console.log('doing pagination fetch')
          break;
        }

        // If there are more results to fetch, and they didn't ask for a specific page, keep going
        if (json.next) {
          response = await fetch(json.next)
        } else {
          break
        }
      }

      // If these were paginated, we need to return the result just as one object
      // Otherwise it needs to be under a `results` field
      // Count is critical as other parts of the app rely on it
      if (json.results) {
        state.data = {
          results: results,
          count: json.count ?? results.length
        }
      }
      else {
        state.data = json;
      }

      // console.log('fetchData:', state.data)
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
