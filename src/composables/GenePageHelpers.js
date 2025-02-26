import { isReactive, isRef, ref, toRaw } from 'vue'
import { PAGE_NAMES, URLS } from '@/constants'
import { useFetchData } from '@/composables/fetchData'
import * as aq from 'arquero'

const genePage = PAGE_NAMES.GENE
const { data, errorMessage, fetchData } = useFetchData()

export function useGenePageHelpers() {
  let flatData = ''

  const flattenData = (data) => {
    let recs = []
    data.forEach((item) => {
      const rec = {
        gwasTrait: item.signal1.analysis.trait.uuid,
        gwasDataset: item.signal1.analysis.dataset.uuid,
        gwasLeadVariant: item.signal1.lead_variant.vid,
        qtlDataset: item.signal2.analysis.dataset.uuid,
        qtlLeadVariant: item.signal2.lead_variant.vid,
        qtlTissue: item.signal2.analysis.tissue,
        qtlGene: item.signal2.analysis.trait.uuid,
        qtlSymbol: item.signal2.analysis.trait.gene.symbol
      }
      recs.push(rec)
    })
    return recs
  }

  const getRawData = async (url) => {
    if(await fetchData(url, 'gene coloc data', genePage)) {
      return toRaw(data.value.results)
    } else {
      throw new Error('Error loading gene data:\n' + errorMessage)
    }
  }

  const getTableAllGenes = async (dataURL, settings) => {
    const { h4, r2, theGene } = settings

    const url = new URL(dataURL, window.location.origin)
    url.searchParams.set('genes', theGene)
    url.searchParams.set('min_h4', h4)
    url.searchParams.set('min_r2', r2)
    // console.log('url', url)

    const rawData = await getRawData(url)
    // console.log('rawData', rawData)
    flatData = flattenData(rawData)
    // console.log('flatData', flatData)

    const tableAllGenes = aq.from(flatData)
    // console.log('tableAllGenes')
    // tableAllGenes.print()
    return tableAllGenes
  }

  const getTableExceptThisGene = async (dataURL, settings, uniqueTraits, uniqueLeadVariants) => {
    const { h4, r2, theGene } = settings
    const url = new URL(dataURL, window.location.origin)
    url.searchParams.set('traits', uniqueTraits)
    url.searchParams.set('variants', uniqueLeadVariants)
    url.searchParams.set('min_h4', h4)
    url.searchParams.set('min_r2', r2)
    // console.log('url', url)

    const data2 = await getRawData(url)
    // console.log('data2', data2)
    const data3 = flattenData(data2)
    // console.log('data3', data3)
    const data4 = data3.filter((el) => el.qtlGene !== theGene)
    // console.log('data4', data4)
    const tableExceptThisGene = aq.from(data4)
    // console.log('tableExceptThisGene')
    // tableExceptThisGene.print(999)
    return tableExceptThisGene
  }

  const getTableGroupedAnyTissue = async (tableExceptThisGene) => {
    const table3 = tableExceptThisGene.groupby('gwasTrait', 'gwasLeadVariant')
    // table3.print(999)

    // 1. Group by gwasTrait and gwasLead, roll up qtlGene column into array of all qtlGene values per group
    const groupedAnyTissue = table3
      .groupby('gwasTrait', 'gwasLeadVariant')
      .rollup({ allGenes: aq.op.array_agg('qtlSymbol') })
    // groupedAnyTissue.print(999)

    const groupedAnyTissueDeDuped = groupedAnyTissue.objects().map(row => {
      const allGenes = row.allGenes ? [...new Set(row.allGenes)] : []
      const allGenesCount = allGenes.length ?? 0
      return {
        gwasTrait: row.gwasTrait,
        gwasLeadVariant: row.gwasLeadVariant,
        otherGenesAnyTissueCount: allGenesCount,
        otherGenesAnyTissue: allGenes
      }
    })
    // console.log('groupedAnyTissueDeDuped', groupedAnyTissueDeDuped)

    const t1 = aq.from(groupedAnyTissueDeDuped)
    return t1
  }

  const getTableGroupedATissue =async (tableExceptThisGene) => {
    const table4 = tableExceptThisGene.groupby('gwasTrait', 'gwasLeadVariant', 'qtlTissue')
    // table4.print(999)

    // 1. Group by gwasTrait and gwasLead, roll up qtlGene column into array of all qtlGene values per group
    const groupedByTissue = table4
      .groupby('gwasTrait', 'gwasLeadVariant', 'qtlTissue')
      .rollup({ allGenes: aq.op.array_agg('qtlSymbol') })
    // groupedByTissue.print(999)

    // 2. Post-process the rollup result to deduplicate the gene list.
    const groupedByTissueDeDuped = groupedByTissue.objects().map(row => {
      const allGenes = row.allGenes ? [...new Set(row.allGenes)] : []
      const allGenesCount = allGenes.length
      return {
        gwasTrait: row.gwasTrait,
        gwasLeadVariant: row.gwasLeadVariant,
        qtlTissue: row.qtlTissue,
        otherGenesSameTissueCount: allGenesCount,
        otherGenesSameTissue: allGenes
      }
    })
    // console.log('groupedByTissueDeDuped', groupedByTissueDeDuped)
    const t2 = aq.from(groupedByTissueDeDuped)
    return t2
  }

  const getTheData = async (settings) => {
    console.log('settings in helpers', settings)

    const tableAllGenes = await getTableAllGenes(URLS[genePage], settings)

    const uniqueTraits = [...new Set(tableAllGenes.array('gwasTrait'))].join(',')
    console.log('uniqueTraits', uniqueTraits)
    const uniqueLeadVariants = [...new Set(tableAllGenes.array('gwasLeadVariant'))].join(',')
    console.log('uniqueLeadVariants', uniqueLeadVariants)

    const tableExceptThisGene = await getTableExceptThisGene(URLS[genePage], settings, uniqueTraits, uniqueLeadVariants)

    const tableGroupedAnyTissue = await getTableGroupedAnyTissue(tableExceptThisGene)

    const tableGroupedATissue = await getTableGroupedATissue(tableExceptThisGene)

    const semiFinalTable = tableAllGenes
      .join_left(tableGroupedAnyTissue)
      .join_left(tableGroupedATissue)
    // semiFinalTable.print(999)

    // this converts 'undefined' to 0 in the count columns
    const filledTable = semiFinalTable.derive({
      otherGenesSameTissueCount: d => d.otherGenesSameTissueCount ?? 0,
      otherGenesSameTissue: d => d.otherGenesSameTissue ?? []
    })
    // filledTable.print()

    return filledTable.objects()
  }

  const table2Headers = [
    { title: 'GWAS Trait', value: 'gwasTrait', sortable: true, },
    { title: 'GWAS Dataset', value: 'gwasDataset', sortable: true, },
    { title: 'GWAS Lead Variant', value: 'gwasLeadVariant', sortable: true, },
    { title: 'QTL Dataset', value: 'qtlDataset', sortable: true, },
    { title: 'QTL Lead Variant', value: 'qtlLeadVariant', sortable: true, },
    { title: 'QTL Tissue', value: 'qtlTissue', sortable: true, },
    { title: 'QTL Gene', value: 'qtlGene', sortable: true, },
    { title: 'QTL Symbol', value: 'qtlSymbol', sortable: true, },
    { title: 'Other Genes Any Tissue Count', value: 'otherGenesAnyTissueCount', sortable: true, },
    { title: 'Other Genes Any Tissue', value: 'otherGenesAnyTissue', sortable: true, },
    { title: 'Other Genes Same Tissue Count', value: 'otherGenesSameTissueCount', sortable: true, },
    { title: 'Other Genes Same Tissue', value: 'otherGenesSameTissue', sortable: true, },
  ]

  return { getTheData, table2Headers }
}
