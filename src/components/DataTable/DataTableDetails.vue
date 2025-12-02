<template>
  <div id="dataTableDetails">
  <table>
    <thead>
      <tr>
        <td colspan="2">
          <ActionButton title="LocusZoom" @click="onLZclick"/>
          <ActionButton title="MultiZoom" @click="onMZclick" class="ml-4"/>
        </td>
        <td>View Local Page</td>
        <td>View Page on AMP CMD Portal</td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Trait 1</td>
        <td>{{ s1ShortName }} ({{ s1LongName }})</td>
        <td><span class="coLink" @click.stop="onMHclick">Manhattan plot</span></td>
        <td><DataTableDetailLink :args="{
          shortName: s1ShortName,
          checkName: s1TraitKPID,
          checkURL: URLS.PORTAL_PHEN_CHECK,
          pageURL: URLS.PORTAL_PHEN_PAGE,
          traitType: 'phenotype',
          }"/>
        </td>
      </tr>

      <tr>
        <td>Trait 2</td>
        <td>{{ s2TraitGene }} ({{ s2TraitUuid }})</td>
        <td><a :href="geneLink" class="coLink" target="_blank">{{ s2TraitGene }} page</a></td>
        <td><DataTableDetailLink :args="{
          shortName: s2TraitGene,
          checkName: s2TraitGene,
          checkURL: URLS.PORTAL_GENE_CHECK,
          pageURL: URLS.PORTAL_GENE_PAGE,
          traitType: 'gene',
          }"/>
        </td>
      </tr>

      <tr>
        <td>Variant 1</td>
        <td>{{ variant1 }}</td>
        <td></td>
        <td><DataTableDetailLink :args="{
          shortName: variant1,
          checkName: variant1?.replace(/_/g, ':'),
          checkURL: URLS.PORTAL_VAR_CHECK,
          pageURL: URLS.PORTAL_VAR_PAGE,
          traitType: 'variant',
          }"/>
        </td>
      </tr>

      <tr>
        <td>Variant 2</td>
        <td>{{ variant2 }}</td>
        <td></td>
        <td><DataTableDetailLink :args="{
          shortName: variant2,
          checkName: variant2?.replace(/_/g, ':'),
          checkURL: URLS.PORTAL_VAR_CHECK,
          pageURL: URLS.PORTAL_VAR_PAGE,
          traitType: 'variant',
          }"/>
        </td>
      </tr>
<!--      <tr>-->
<!--        <td>signal1ID</td>-->
<!--        <td>{{ signal1ID }}</td>-->
<!--        <td></td>-->
<!--        <td></td>-->
<!--      </tr>-->
<!--      <tr>-->
<!--        <td>signal2ID</td>-->
<!--        <td>{{ signal2ID }}</td>-->
<!--        <td></td>-->
<!--        <td></td>-->
<!--      </tr>-->
    </tbody>
  </table>
  </div>
</template>

<script setup>
// *** Imports *****************************************************************
import { ref } from 'vue'
import { PAGE_NAMES, URLS } from '@/constants'
import { useAppStore } from '@/stores/AppStore'
import { useFetchData } from '@/composables/fetchData'
import router from '@/router'

// *** Composables *************************************************************
const appStore = useAppStore()
const { data, errorMessage, fetchData } = useFetchData()

// *** Props *******************************************************************
const props = defineProps({
  item: Object,
})

// *** Variables ***************************************************************
const s1trait = props.item?.signal1?.analysis?.trait
const s2trait = props.item?.signal2?.analysis?.trait

const s1ShortName = s1trait?.uuid
const s1LongName = s1trait?.phenotype?.name
const s1TraitKPID = s1trait?.phenotype?.kp_id

const s2TraitGene = s2trait?.gene?.symbol
const s2TraitUuid = s2trait?.uuid

// const signal1ID = props.item.signal1.uuid
// const signal2ID = props.item.signal2.uuid

const variant1 = props.item?.signal1?.lead_variant?.vid
const variant2 = props.item?.signal2?.lead_variant?.vid

const locuszoomPage = PAGE_NAMES.LOCUSZOOM
const manhattanPage = PAGE_NAMES.MANHATTAN
const multizoomPage = PAGE_NAMES.MULTIZOOM

const geneLink = ref(`/${PAGE_NAMES.GENE}?gene=${s2TraitGene}`)

// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
const onLZclick = async () => {
  await router.push({name: locuszoomPage, params: {}})
}

const onMHclick = () => {
  const analysisID = props.item.signal1.analysis.uuid
  appStore.setPageKey(manhattanPage, 'analysisID', analysisID)
  const cpn = appStore.currentPageName
  if(cpn === manhattanPage) {
    loadManhattanData()
  } else {
    router.push({name: manhattanPage})
  }
}

const onMZclick = async () => {
  await router.push({name: multizoomPage, params: {}})
}

// *** Utility functions *******************************************************
const loadManhattanData = () => {
  appStore[manhattanPage].loadManhattanDataFlag = !appStore[manhattanPage].loadManhattanDataFlag
}

// *** Configuration data ******************************************************
</script>

<style scoped>
table {
  border-collapse: collapse;
  border: 1px dotted black;
}

td {
  border: 1px dotted #ccc;
  padding: 4px 8px 4px 8px;
  max-width: 300px;
}

thead {
  text-align: center;
}
</style>
