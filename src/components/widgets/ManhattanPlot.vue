<template>
  <div ref="manhattanPlotContainer" class="manhattan-plot"></div>
</template>

<script setup>
import { defineEmits, nextTick, onMounted, ref } from 'vue'
import { create_gwas_plot } from '@/vis/pheweb_plots'

const props = defineProps({
  binData: Object,
})

const emit = defineEmits(['onSelectSignals'])

const tooltip_template = `<b><%- d.chrom %>:<%- d.pos.toLocaleString() %> <%- (d.ref && d.alt) ? (d.ref + "/" + d.alt) : "" %></b><br>
            -log<sub>10</sub>(p): <%- d.neg_log_pvalue && (+d.neg_log_pvalue).toFixed(3) %><br>
            <%- d.qtl_genes && d.qtl_genes.length ? 'QTL gene(s): ' + d.qtl_genes.map(function(gene) { return gene.symbol; }).join(", ") : "" %>
            <% if (d.qtl_genes && d.qtl_genes.length) { print('<br>'); } %>
            Nearest gene(s): <%- d.nearest_genes && d.nearest_genes.length && d.nearest_genes.map(function(gene) { return gene.symbol; }).join(", ") %>`

const onClickSignals = (signals) => {
  // ignore click on blue and gray, which yield null signals
  if(signals) emit('onSelectSignals', signals)
}

const manhattanPlotContainer = ref(null)

onMounted(async () => {
  create_gwas_plot(manhattanPlotContainer.value, tooltip_template, props.binData.variant_bins, props.binData.unbinned_variants, onClickSignals)
})
</script>

<style>
  .d3-tip {
    line-height: 1.4;
    padding: 12px;
    background: rgba(0, 0, 0, 0.8);
    color: #fff;
    border-radius: 4px;
    pointer-events: none;
  }

  /* Creates a small triangle extender for the tooltip */
  .d3-tip:after {
    display: inline;
    font-size: 10px;
    width: 100%;
    line-height: 1;
    color: rgba(0, 0, 0, 0.8);
    position: absolute;
    pointer-events: none;
  }

  /* Northward tooltips */
  .d3-tip.n:after {
    content: "\25BC";
    margin: -3px 0 0 0;
    top: 100%;
    left: 0;
    text-align: center;
  }

  .manhattan-plot {
    min-width: 700px;
    width: 100%;
    display: block;
  }

  .manhattan-plot .axis > path.domain {
    stroke-width: 2px;
    stroke: #666;
    fill: none;
  }

  .manhattan-plot .axis g.tick line {
    stroke: #666;
  }
</style>
