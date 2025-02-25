import { isReactive, isRef, ref, toRaw } from 'vue'
import { PAGE_NAMES, URLS } from '@/constants'
import { useFetchData } from '@/composables/fetchData'
import * as aq from 'arquero'

const genePage = PAGE_NAMES.GENES
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

  const getTheData = async (theGene) => {
    const url = `${URLS[genePage]}?genes=${theGene}`
    const rawData = await getRawData(url)
    flatData = flattenData(rawData)
    const tableAllGenes = aq.from(flatData)
    // tableAllGenes.print()

    const uniqueTraits = [...new Set(tableAllGenes.array('gwasTrait'))].join(',')
    const uniqueLeads = [...new Set(tableAllGenes.array('gwasLeadVariant'))].join(',')

    const url2 = `${URLS[genePage]}?traits=${uniqueTraits}&variants=${uniqueLeads}`
    // console.log('url2', url2)
    const data2 = await getRawData(url2)
    // console.log('data2', data2)
    const data3 = flattenData(data2)
    // console.log('data3', data3)
    const data4 = data3.filter((el) => el.qtlGene !== theGene)
    // console.log('data4', data4)
    const tableExceptThisGene = aq.from(data4)
    // tableExceptThisGene.print(999)

    const table3 = tableExceptThisGene.groupby('gwasTrait', 'gwasLeadVariant')
    // table3.print(999)

    // 1. Group by gwasTrait and gwasLead, roll up qtlGene column into array of all qtlGene values per group
    const groupedAnyTissue = table3
      .groupby('gwasTrait', 'gwasLeadVariant')
      .rollup({ allGenes: aq.op.array_agg('qtlGene') })
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

    const table4 = tableExceptThisGene.groupby('gwasTrait', 'gwasLeadVariant', 'qtlTissue')
    // table4.print(999)

    // 1. Group by gwasTrait and gwasLead, roll up qtlGene column into array of all qtlGene values per group
    const groupedByTissue = table4
      .groupby('gwasTrait', 'gwasLeadVariant', 'qtlTissue')
      .rollup({ allGenes: aq.op.array_agg('qtlGene') })
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

    const t1 = aq.from(groupedAnyTissueDeDuped)
    const t2 = aq.from(groupedByTissueDeDuped)

    // t1.print(999)
    // t2.print(999)

    const semiFinalTable = tableAllGenes
      .join_left(t1)
      .join_left(t2)
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
