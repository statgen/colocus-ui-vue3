import { toRaw } from 'vue'
import * as aq from 'arquero'
import { useFetchData } from '@/composables/fetchData'
import { URLS } from '@/constants'
import { parseVariant2 } from '@/util/util'

export function useLZ2DataLoaders() {
  const loadSignalData = async (signalRef, signalUUID, LDRef, build, yAxis, region) => {
    const { data, errorMessage, fetchData } = useFetchData()
    const pvLD = parseVariant2(LDRef, region)
    let base = `${URLS.LD_DATA}/${build}/region/`
    let url = `${base}?chrom=${pvLD.chr}&start=${pvLD.start}&end=${pvLD.end}&variant=${pvLD.chr}:${pvLD.loc}_${pvLD.ref}/${pvLD.alt}`
    let ldData = []
    if(await fetchData(url, 'lz2 ld data', 'MZ')) {
      ldData = toRaw(data.value)
    } else {
      console.error("Failed to fetch LD data")
      return
    }

    const pvSignal = parseVariant2(signalRef, region)
    base = `${URLS.SIGNALS_DATA}/${signalUUID}/region`
    url = `${base}?chrom=${pvSignal.chr}&start=${pvSignal.start}&end=${pvSignal.end}`
    let signalData
    if(await fetchData(url, 'lz2 signal data', 'MZ')) {
      signalData = toRaw(data.value)
    } else {
      console.error("Failed to fetch signal data")
      return
    }

    const t1 = aq.from(signalData)

    // Handle the case where there is no LD data returned
    // We can create a dummy entry for the lead variant in r2 = 1.0 with itself (which is true)
    if (!ldData || ldData.length === 0) {
      ldData = [{
        variant1: `${pvLD.chr}_${pvLD.loc}_${pvLD.ref}_${pvLD.alt}`,
        variant2: `${pvLD.chr}_${pvLD.loc}_${pvLD.ref}_${pvLD.alt}`,
        position1: pvLD.loc,
        position2: pvLD.loc,
        correlation: 1.0,
      }]
    }
    let t2 = aq.from(ldData)
    if (t2.columnNames().includes('variant2')) {
      t2 = t2.rename({ variant2: 'variant' })
    }
    if (t2.columnNames().includes('correlation')) {
      t2 = t2.rename({ correlation: 'r2' })
    }

    const t3 = t1.join_left(t2, 'variant')
    const t4 = t3.derive ({
      variant: d => aq.op.replace(d.variant, /[:/]/g, '_'),
      variant1: d => aq.op.replace(d.variant1, /[:/]/g, '_'),
    })
    const t5 = t4.objects()

    const t6 = t5.map(row => ({
      x: row.position,
      y: yAxis === 'marginal' ? row.t1_neg_log_pvalue : row.t2_neg_log_pvalue,
      r2: row.r2,
      variant: row.variant,
      refAllele: row.ref_allele,
      isLead: signalRef === row.variant,
      beta: yAxis === 'marginal' ? row.t1_beta : row.t2_beta,
    }))

    t6.sort((a, b) => {
      if(a.r2 !== b.r2) return a.r2 - b.r2
      return a.y - b.y
    })
    return t6
  }

  const loadRecombData = async (leadVariant, build, region) => {
    const { data, errorMessage, fetchData } = useFetchData()
    const pv = parseVariant2(leadVariant, region)
    const url = new URL(URLS.PORTALDEV_RECOMB)
    url.searchParams.set('filter', `chromosome eq '${pv.chr}' and position le ${pv.end} and position ge ${pv.start}`)
    url.searchParams.set('build', build)
    if(await fetchData(url, "recombination data", "region-plot")) {
      const recombData = toRaw(data.value).data
      const recombArray = recombData.position.map((_, i) => ({
        position: recombData.position[i],
        recomb_rate: recombData.recomb_rate[i],
      }))
      return recombArray
    } else {
      console.error("Failed to fetch recomb data")
    }
  }

  return {
    loadSignalData,
    loadRecombData,
  }
}
