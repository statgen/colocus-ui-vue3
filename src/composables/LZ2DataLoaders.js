import { toRaw } from 'vue'
import * as aq from 'arquero'
import { useFetchData } from '@/composables/fetchData'
import { LZ_DISPLAY_OPTIONS, URLS } from '@/constants'


export function useLZ2DataLoaders() {
  const getLDColor = (r2, theme = 'locuszoom') => {
    const colors = LZ_DISPLAY_OPTIONS.LZ_COLOR_THEMES[theme] || LZ_DISPLAY_OPTIONS.LZ_COLOR_THEMES.locuszoom
    if (r2 == null) return colors[6]
    if (r2 > 0.999999) return colors[5]
    if (r2 > 0.8) return colors[4]
    if (r2 > 0.6) return colors[3]
    if (r2 > 0.4) return colors[2]
    if (r2 > 0.2) return colors[1]
    return colors[0]
  }

  const getShape = (beta, v1, v2) => {
    if (v1 === v2) return 'diamond'
    else if (beta > 0) return 'up-triangle'
    else if (beta < 0) return 'down-triangle'
    else return 'circle'
  }

  const loadSignalData = async (variant, pv, signal, build, theme) => {
    const { data, errorMessage, fetchData } = useFetchData()

    let base = `${URLS.LD_DATA}/${build}/region/`
    let url = `${base}?chrom=${pv.chr}&start=${pv.start}&end=${pv.end}&variant=${pv.chr}:${pv.loc}_${pv.ref}/${pv.alt}`
    let ldData = []
    if(await fetchData(url, 'lz2 ld data', 'lz2test')) {
      ldData = toRaw(data.value)
    } else {
      console.error("Failed to fetch LD data")
      return
    }

    base = `${URLS.SIGNALS_DATA}/${signal}/region`
    url = `${base}?chrom=${pv.chr}&start=${pv.start}&end=${pv.end}`
    let signalData
    if(await fetchData(url, 'lz2 signal data', 'lz2test')) {
      signalData = toRaw(data.value)
    } else {
      console.error("Failed to fetch signal data")
      return
    }

    const t1 = aq.from(signalData)
    const t2 = aq.from(ldData).rename({ variant2: 'variant' }).rename({ correlation: 'r2' })
    const t3 = t1.join_left(t2, 'variant')
    const t4 = t3.derive ({
      variant: d => aq.op.replace(d.variant, /[:/]/g, '_'),
      variant1: d => aq.op.replace(d.variant1, /[:/]/g, '_'),
    })
    const t5 = t4.objects()

    const t6 = t5.map(row => ({
      x: row.position,
      y: row.t1_neg_log_pvalue,
      r2: row.r2,
      variant: row.variant,
      refAllele: row.ref_allele,
      color: getLDColor(row.r2, theme),
      shape: getShape(row.t1_beta, variant, row.variant),
      size: 4,
    }))

    t6.sort((a, b) => {
      if(a.r2 !== b.r2) return a.r2 - b.r2
      return a.y - b.y
    })
    return t6
  }

  const loadRecombData = async (pv, build) => {
    const { data, errorMessage, fetchData } = useFetchData()
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
