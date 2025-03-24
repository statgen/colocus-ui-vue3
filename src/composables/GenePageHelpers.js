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

    const url = new URL(URLS[genePage], window.location.origin)
    url.searchParams.set('genes', allAssocGenes)
    const rawData = await getRawData(url)

    let recs = {}
    let genes = []
    rawData.forEach((item) => {
      const gene = item.signal2.analysis.trait.gene.symbol
      if(!genes.includes(gene)) {
        genes.push(gene)
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
        const sortedGeneList = tc.array('gene').join(', ')
        row.otherGenesSameTissue = sortedGeneList
      }
    })
    return t1Objects
  }

  const getRawData = async (url) => {
    if(await fetchData(url, 'gene coloc data', genePage)) {
      return toRaw(data.value.results)
    } else {
      throw new Error('Error loading gene data:\n' + errorMessage)
    }
  }

  const getTableWithGene = async (dataURL, settings) => {
    const { h4, r2, theGene } = settings

    const url = new URL(dataURL, window.location.origin)
    url.searchParams.set('genes', theGene)
    url.searchParams.set('min_h4', h4)
    url.searchParams.set('min_r2', r2)

    const rawData = await getRawData(url)
    const flatData = flattenData(rawData)

    const tableWithGene = aq.from(flatData)
    return tableWithGene
  }

  const getTableWithTraitsVariants = async (dataURL, settings, uniqueTraits, uniqueLeadVariants) => {
    const { h4, r2 } = settings
    const url = new URL(dataURL, window.location.origin)
    url.searchParams.set('traits', uniqueTraits)
    url.searchParams.set('variants', uniqueLeadVariants)
    url.searchParams.set('min_h4', h4)
    url.searchParams.set('min_r2', r2)

    const rawData = await getRawData(url)
    const flatData = flattenData(rawData)
    const tableWithTraitsVariants = aq.from(flatData)
    return tableWithTraitsVariants
  }

  const getTableGroupedSameTissue =async (inputTable, theGene) => {

    const tableGrouped = inputTable.groupby('gwasTrait', 'gwasLeadVariant', 'qtlTissue')

    const tableRollup = tableGrouped
      .groupby('gwasTrait', 'gwasLeadVariant', 'qtlTissue')
      .rollup({allGenesArray: aq.op.array_agg('qtlSymbol')})

    const reified = tableRollup.objects()
    // debugger

    const mapped = reified.map((row) => {
      const includedGenes = row.allGenesArray.filter((qtlSymbol) => qtlSymbol !== theGene)
      includedGenes.sort()
      return {
        gwasTrait: row.gwasTrait,
        gwasLeadVariant: row.gwasLeadVariant,
        qtlTissue: row.qtlTissue,
        otherGenesSameTissue: includedGenes.join(', '),
        otherGenesSameTissueCount: includedGenes.length > 0 ? includedGenes.length : '',
      }
    })

    const tableFinal = aq.from(mapped)
    return tableFinal
  }

  const getTableGroupedAnyTissue = async (inputTable, theGene) => {
    const tableWithGeneTissue = inputTable.derive({
      geneTissue: d => `${d.qtlSymbol} (${d.qtlTissue})`
    })

    const tableRollup = tableWithGeneTissue
      .groupby('gwasTrait', 'gwasLeadVariant')
      .rollup({ allGenesArray: aq.op.array_agg_distinct('geneTissue') })

    const reified = tableRollup.objects()

    const mapped = reified.map((row) => {
      const includedGenes = row.allGenesArray.filter((geneTissueStr) => !geneTissueStr.startsWith(`${theGene} (`))
      includedGenes.sort()
      return {
        gwasTrait: row.gwasTrait,
        gwasLeadVariant: row.gwasLeadVariant,
        otherGenesAnyTissue: includedGenes.join(', '),
        otherGenesAnyTissueCount: includedGenes.length > 0 ? includedGenes.length : '',
      }
    })

    const tableFinal = aq.from(mapped)
    return tableFinal
  }

  const getTheData = async (settings) => {
    // first build table 2 ------------------------------------------------------------
    const tableWithGene = await getTableWithGene(URLS[genePage], settings)
    const theGene = tableWithGene.objects()[0].qtlSymbol // use this instead of settings.theGene as it may be an ensembl id
    const uniqueTraits = [...new Set(tableWithGene.array('gwasTrait'))].join(',')
    const uniqueLeadVariants = [...new Set(tableWithGene.array('gwasLeadVariant'))].join(',')

    const tableWithTraitsVariants = await getTableWithTraitsVariants(URLS[genePage], settings, uniqueTraits, uniqueLeadVariants)
    const tableGroupedSameTissue = await getTableGroupedSameTissue(tableWithTraitsVariants, theGene)
    const tableGroupedAnyTissue = await getTableGroupedAnyTissue(tableWithTraitsVariants, theGene)

    const table2 = tableWithGene
      .join_left(tableGroupedSameTissue)
      .join_left(tableGroupedAnyTissue)

    // then build data for table 1 ------------------------------------------------------------
    let t2Grouped = table2
      .groupby('gwasLeadVariant', 'qtlSymbol', 'qtlTissue', 'qtlStudy', 'otherGenesSameTissueCount', 'otherGenesSameTissue', )
      .rollup({
        traitsColocalized: aq.op.array_agg_distinct('gwasTrait')
      })

    const t1Objects = await getTable1Objects(t2Grouped)

    return {
      table1data: t1Objects,
      table2data: table2.objects(),
    }
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
    { title: 'GWAS Lead Variant', sortable: true, value: 'gwasLeadVariant', maxWidth: '10rem', visible: alwaysShow },
    { title: 'Traits Colocalized Count', sortable: true, value: 'traitsColocalizedCount', width: '10rem', align: 'center', visible: alwaysShow },
    { title: 'Traits Colocalized', sortable: true, value: 'traitsColocalized', visible: alwaysShow },
    { title: 'Other Genes Same GWAS Count', sortable: true, value: 'otherGenesSameTissueCount', width: '10rem', align: 'center', visible: alwaysShow },
    { title: 'Other Genes Same GWAS', sortable: true, value: 'otherGenesSameTissue', visible: alwaysShow },
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

    { title: 'Other Genes Same Tissue Count', sortable: true, value: 'otherGenesSameTissueCount', align: 'end', visible: alwaysShow },
    { title: 'Other Genes Same Tissue', sortable: true, value: 'otherGenesSameTissue', minWidth: '12rem', visible: alwaysShow },
    { title: 'Other Genes Any Tissue Count', sortable: true, value: 'otherGenesAnyTissueCount', align: 'end', visible: alwaysShow },
    { title: 'Other Genes Any Tissue', sortable: true, value: 'otherGenesAnyTissue', minWidth: '24rem', visible: alwaysShow },

    { title: 'GWAS Dataset', sortable: true, value: 'gwasDataset', visible: () => showDatasets.value },
    { title: 'QTL Dataset', sortable: true, value: 'qtlDataset', visible: () => showDatasets.value  },
  ]

  return { getTheData, visibleTable1Columns, visibleTable2Columns }
}
