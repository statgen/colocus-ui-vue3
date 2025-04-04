import { computed, ref, toRaw, watch } from 'vue'
import { PAGE_NAMES, URLS } from '@/constants'
import { useFetchData } from '@/composables/fetchData'
import { useAppStore } from '@/stores/AppStore'
import * as aq from 'arquero'

const genePage = PAGE_NAMES.GENE
const { data, errorMessage, fetchData } = useFetchData()

export function useGenePageHelpers() {
  const appStore = useAppStore()

  const flattenData = (data) => {
    let recs = []
    data.forEach((item) => {
      const rec = {
        gwasDataset: item.signal1.analysis.dataset.uuid,
        gwasLeadVariant: item.signal1.lead_variant.vid,
        gwasStudy: item.signal1.analysis.study.uuid,
        gwasTrait: item.signal1.analysis.trait.uuid,
        gwasType: item.signal1.analysis.analysis_type,

        qtlDataset: item.signal2.analysis.dataset.uuid,
        // qtlEnsID: item.signal2.analysis.trait.gene.ens_id,
        qtlGene: item.signal2.analysis.trait.uuid,
        qtlGeneStartPos: item.signal2.analysis.trait.gene.start,
        qtlGeneEndPos: item.signal2.analysis.trait.gene.end,
        qtlLeadVariant: item.signal2.lead_variant.vid,
        qtlStudy: item.signal2.analysis.study.uuid,
        qtlSymbol: item.signal2.analysis.trait.gene.symbol,
        qtlTissue: item.signal2.analysis.tissue,
        qtlTrait: item.signal2.analysis.trait,
        qtlType: item.signal2.analysis.trait.biomarker_type.replace('-expression', ''),
      }
      recs.push(rec)
    })
    return recs
  }

  const getGeneDetails = async (table) => {
    let allAssocGenes = table
      .array('otherGenesSameTissue')
      .flatMap(row => row.split(','))  // split each string into array and flatten
      .map(val => val.trim())          // remove whitespace
      .filter(val => val !== '')       // remove empty strings
      .join(',')

    allAssocGenes = Array.from(new Set(allAssocGenes.split(','))).join(',') // remove duplicates
    if(!allAssocGenes) return {}

    const url = new URL(URLS[genePage], window.location.origin)
    url.searchParams.set('genes', allAssocGenes)
    const rawData = await getRawData(url, 'gene data: gene details')

    let recs = {}
    rawData.forEach((item) => {
      const gene = item.signal2.analysis.trait.gene.symbol
      if(!recs.hasOwnProperty(gene)) {
        recs[gene] = {
          start: item.signal2.analysis.trait.gene.start,
          end: item.signal2.analysis.trait.gene.end,
        }
      }
    })

    return recs
  }

  const getTable1Objects = async (t2Grouped) => {
    const geneDetails = await getGeneDetails(t2Grouped)

    const t1Objects = t2Grouped.objects()
    t1Objects.forEach(row => {
      row.traitsColocalizedCount = row.traitsColocalized.length
      row.traitsColocalized = row.traitsColocalized.sort().join(', ')

      if(row.otherGenesSameTissueCount > 0) {
        const gwasLeadVariantPos = parseInt(row.gwasLeadVariant.split('_')[1])
        let genes = row.otherGenesSameTissue
        genes = genes.replace(/ /g, '')
        genes = genes.split(',')
        genes = [... new Set(genes)]
        const geneDistances = []
        genes.forEach(gene => {
          const details = geneDetails[gene]
          const distance = Math.min(
            Math.abs(gwasLeadVariantPos - details.start),
            Math.abs(gwasLeadVariantPos - details.end),
          )
          geneDistances.push({ gene, distance })
        })
        const tc = aq.from(geneDistances).orderby('distance')
        const sortedGeneList = tc.array('gene').join(',')
        row.otherGenesSameTissue = sortedGeneList
      }
    })
    return t1Objects
  }

  const getRawData = async (url, reason) => {
    if(await fetchData(url, reason, genePage)) {
      return toRaw(data.value.results)
    } else {
      throw new Error('Error loading gene data:\n' + errorMessage)
    }
  }

  const getTableForGene = async (dataURL, settings) => {
    const { h4, r2, theGene } = settings

    const url = new URL(dataURL, window.location.origin)
    url.searchParams.set('genes', theGene)
    url.searchParams.set('min_h4', h4)
    url.searchParams.set('min_r2', r2)

    const rawData = await getRawData(url, 'gene data: for gene')
    const flatData = flattenData(rawData)

    const tableForGene = aq.from(flatData)
    return tableForGene
  }

  const gettableForTraitsVariants = async (dataURL, settings, uniqueTraits, uniqueLeadVariants) => {
    const { h4, r2 } = settings
    const url = new URL(dataURL, window.location.origin)
    url.searchParams.set('traits', uniqueTraits)
    url.searchParams.set('variants', uniqueLeadVariants)
    url.searchParams.set('min_h4', h4)
    url.searchParams.set('min_r2', r2)

    const rawData = await getRawData(url, 'gene data: for traits and variants')
    const flatData = flattenData(rawData)
    const tableForTraitsVariants = aq.from(flatData)
    return tableForTraitsVariants
  }

  const getTableGroupedSameTissue =async (inputTable, theGene) => {

    const tableGrouped = inputTable.groupby('gwasTrait', 'gwasLeadVariant', 'qtlTissue')

    const tableRollup = tableGrouped
      .groupby('gwasTrait', 'gwasLeadVariant', 'qtlTissue')
      .rollup({allGenesArray: aq.op.array_agg('qtlSymbol')})

    const tableRollupObjects = tableRollup.objects()
    // debugger

    const mapped = tableRollupObjects.map((row) => {
      const includedGenes = row.allGenesArray.filter((qtlSymbol) => qtlSymbol !== theGene)
      includedGenes.sort()
      return {
        gwasTrait: row.gwasTrait,
        gwasLeadVariant: row.gwasLeadVariant,
        qtlTissue: row.qtlTissue,
        otherGenesSameTissue: includedGenes.join(','),
        otherGenesSameTissueCount: includedGenes.length > 0 ? includedGenes.length : '',
      }
    })

    const tableFinal = aq.from(mapped)
    return tableFinal
  }

  const getTableGroupedAnyTissue = async (inputTable, theGene) => {
    const tableForGeneTissue = inputTable.derive({
      geneTissue: d => `${d.qtlSymbol} (${d.qtlTissue})`
    })

    const tableRollup = tableForGeneTissue
      .groupby('gwasTrait', 'gwasLeadVariant')
      .rollup({ allGenesArray: aq.op.array_agg_distinct('geneTissue') })

    const tableRollupObjects = tableRollup.objects()

    const mapped = tableRollupObjects.map((row) => {
      const includedGenes = row.allGenesArray.filter((geneTissueStr) => !geneTissueStr.startsWith(`${theGene} (`))
      includedGenes.sort()
      return {
        gwasTrait: row.gwasTrait,
        gwasLeadVariant: row.gwasLeadVariant,
        otherGenesAnyTissue: includedGenes.join(','),
        otherGenesAnyTissueCount: includedGenes.length > 0 ? includedGenes.length : '',
      }
    })

    const tableFinal = aq.from(mapped)
    return tableFinal
  }

  const getTable2Data = async (settings) => {
    const tableForGene = await getTableForGene(URLS[genePage], settings)

    if(tableForGene.size < 1) return []

    const theGene = tableForGene.get('qtlSymbol', 0) // use this instead of settings.theGene as it may be an ensembl id
    const uniqueTraits = [...new Set(tableForGene.array('gwasTrait'))].join(',')
    const uniqueLeadVariants = [...new Set(tableForGene.array('gwasLeadVariant'))].join(',')

    const tableForTraitsVariants = await gettableForTraitsVariants(URLS[genePage], settings, uniqueTraits, uniqueLeadVariants)
    const tableGroupedSameTissue = await getTableGroupedSameTissue(tableForTraitsVariants, theGene)
    const tableGroupedAnyTissue = await getTableGroupedAnyTissue(tableForTraitsVariants, theGene)

    // console.log('tableForGene', tableForGene.columnNames())
    // console.log('tableGroupedSameTissue', tableGroupedSameTissue.columnNames())
    // console.log('tableGroupedAnyTissue', tableGroupedAnyTissue.columnNames())

    // explicit joins don't work, yield console error, so using implicit joins, not specifying join columns
    const table2 = tableForGene
      .join_left(tableGroupedSameTissue) //, ['gwasTrait', 'gwasLeadVariant'])
      .join_left(tableGroupedAnyTissue) //, ['gwasTrait', 'gwasLeadVariant'])
    return table2.objects()
  }

    const getTable1Data = async (table2) => {
      const t2 = aq.from(table2)
      if(t2.size < 1) return []
      let t2Grouped = t2
        .groupby('gwasLeadVariant', 'qtlSymbol', 'qtlTissue', 'qtlStudy', 'otherGenesSameTissueCount', 'otherGenesSameTissue', )
        .rollup({
          traitsColocalized: aq.op.array_agg_distinct('gwasTrait')
        })

      const t1Objects = await getTable1Objects(t2Grouped)
      return t1Objects
    }

  const alwaysShow = () => true

  const showDatasets = ref(false)
  const showEnsIDs = ref(false)

  watch(() => appStore[genePage].showDatasets, newValue => { showDatasets.value = newValue })
  watch(() => appStore[genePage].showEnsIDs, newValue => { showEnsIDs.value = newValue })

  const visibleTable1Columns = computed(() => {
    return table1Headers.filter(header => header.visible())
  })

  const table1Headers = [
    { title: 'QTL Tissue', sortable : true, value: 'qtlTissue', width: '7rem', visible: alwaysShow },
    { title: 'QTL Study', sortable: true, value: 'qtlStudy', width: '7rem', visible: alwaysShow },
    { title: 'GWAS Lead Variant', sortable: true, value: 'gwasLeadVariant', width: '10rem', visible: alwaysShow },
    { title: 'Traits Colocalized Count', sortable: true, value: 'traitsColocalizedCount', width: '10rem', align: 'center', visible: alwaysShow },
    { title: 'Traits Colocalized', sortable: true, value: 'traitsColocalized', width: '15rem', visible: alwaysShow },
    { title: 'Other Genes, Same GWAS, Same Tissue (Count)', sortable: true, value: 'otherGenesSameTissueCount', width: '10rem', align: 'center', visible: alwaysShow },
    { title: 'Other Genes, Same GWAS, Same Tissue', sortable: true, value: 'otherGenesSameTissue', visible: alwaysShow },
  ]

  const visibleTable2Columns = computed(() => {
    return table2Headers.filter(header => header.visible())
  })

  const table2Headers = [
    { title: 'Study 1', sortable: true, value: 'gwasStudy', minWidth: '7rem', visible: alwaysShow },
    { title: 'Trait 1', sortable: true, value: 'gwasTrait', minWidth: '7rem', visible: alwaysShow },
    { title: 'Type 1', sortable: true, value: 'gwasType', minWidth: '7rem', visible: alwaysShow },

    { title: 'Study 2', sortable: true, value: 'qtlStudy', minWidth: '7rem', visible: alwaysShow },
    { title: 'Trait 2', sortable: true, value: 'qtlSymbol', minWidth: '10rem', visible: alwaysShow },
    { title: 'Type 2', sortable: true, value: 'qtlType', minWidth: '7rem', visible: alwaysShow },
    { title: 'Trait 2 ENSG', sortable: true, value: 'qtlTrait', minWidth: '12rem', visible: () => showEnsIDs.value },
    { title: 'Tissue', sortable: true, value: 'qtlTissue', minWidth: '7rem', visible: alwaysShow },

    { title: 'Trait 1 Variant', sortable: true, value: 'gwasLeadVariant', minWidth: '12rem', visible: alwaysShow },
    { title: 'Trait 2 Variant', sortable: true, value: 'qtlLeadVariant', minWidth: '12rem', visible: alwaysShow },

    { title: 'Other Genes, Same GWAS, Same Tissue (Count)', sortable: true, value: 'otherGenesSameTissueCount', width: '10rem', align: 'end', visible: alwaysShow },
    { title: 'Other Genes, Same GWAS, Same Tissue', sortable: true, value: 'otherGenesSameTissue', minWidth: '15rem', visible: alwaysShow },
    { title: 'Other Genes, Same GWAS, Other Tissue (Count)', sortable: true, value: 'otherGenesAnyTissueCount', width: '10rem', align: 'end', visible: alwaysShow },
    { title: 'Other Genes, Same GWAS, Other Tissue', sortable: true, value: 'otherGenesAnyTissue', minWidth: '15rem', visible: alwaysShow },

    { title: 'GWAS Dataset', sortable: true, value: 'gwasDataset', visible: () => showDatasets.value },
    { title: 'QTL Dataset', sortable: true, value: 'qtlDataset', visible: () => showDatasets.value  },
  ]

  return { getTable1Data, getTable2Data, visibleTable1Columns, visibleTable2Columns }
}
