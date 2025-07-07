<template>
  <DefaultLayout>
    <h1>LocusZoom plotter v2 test page</h1>
    <div ref="plotContainer" class="plot-container mt-4"></div>
  </DefaultLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, toRaw } from 'vue'
import * as aq from 'arquero'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { usePlotManager } from '@/composables/D3RPPlotManager'
import { useFetchData } from '@/composables/fetchData'
import { URLS } from '@/constants'

const { mountPlot, clearAllPlots } = usePlotManager()

const plotContainer = ref(null)

const colorThemes = {
  locuszoom: ['rgba(70, 54, 153, 0.2)', 'rgb(38, 188, 225)', 'rgb(110, 254, 104)', 'rgb(248, 195, 42)', 'rgb(219, 61, 17)', 'rgb(150, 50, 184)'],
  greyscale: ['#cccccc', '#bbbbbb', '#999999', '#777777', '#444444', '#000000'],
}

function getLDColor(r2, theme = 'locuszoom') {
  const colors = colorThemes[theme] || colorThemes.locuszoom
  if (r2 == null) return 'rgb(170, 170, 170)' // fallback for null

  if (r2 > 0.999999) return colors[5]
  if (r2 > 0.8)       return colors[4]
  if (r2 > 0.6)       return colors[3]
  if (r2 > 0.4)       return colors[2]
  if (r2 > 0.2)       return colors[1]
  return colors[0]
}

onMounted(async () => {
  const stuff = '3_33457493_C_A'.split('_')
  const chr = +stuff[0]
  const loc = +stuff[1]
  const ref = stuff[2]
  const alt = stuff[3]
  const start = loc - 250e3 - 1000
  const end = loc + 250e3 + 1000

  const { data, errorMessage, fetchData } = useFetchData()

  const ldURL = `${URLS.LD_DATA}/UKBB_GRCh37_ALL/region/?chrom=${chr}&start=${start}&end=${end}&variant=${chr}:${loc}_${ref}/${alt}`
  let ldData = []
  if(await fetchData(ldURL, 'lz2 ld data', 'lz2test')) {
    ldData = toRaw(data.value)
  }

  const base = '/api/v1/signals/Y7was11zaKDGC2LdxouRsL/region'
  const url = `${base}?chrom=${chr}&start=${start}&end=${end}`
  let signalData
  if(await fetchData(url, 'lz2 data', 'lz2test')) {
    signalData = toRaw(data.value)
  }

  const t1 = aq.from(signalData)
  const t2 = aq.from(ldData).rename({ variant2: 'variant' }).rename({ correlation: 'r2' })
  const t3 = t1.join_left(t2, 'variant')
  const t4 = t3.derive ({
    variant: d => aq.op.replace(d.variant, /[:/]/g, '_'),
    variant1: d => aq.op.replace(d.variant1, /[:/]/g, '_'),
  })
  const t5 = t4.objects()

  const data2 = t5.map(row => ({
    x: row.position,
    y: row.t1_neg_log_pvalue,
    color: getLDColor(row.r2, 'locuszoom'),
    size: 4,
  }))

   mountPlot({
      id: 'plot1',
      plotContainer: plotContainer.value,
      type: 'region',
      data: data2,
      title: 'Plot 1',
      chromosome: chr,
    })
})

onBeforeUnmount(() => {
  clearAllPlots()
})
</script>

<style scoped>
.plot-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-start;
}
</style>
