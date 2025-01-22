/*
 * Note: Instead of recreating the whole plot each time the UI changes, in theory we could force a plot update.
 * In that case, the following key would be added to each config element.
 * However, couldn't get update to function reliably.
 *   dataName: "colocClassData",
 */

const VegaPlotConfig = {
  ColocalizationClass: {
    plotID: "1",
    dataKey: "colocClass",
    description: "descriptive text",
    pageSubhead: "Colocalization class",
    containerWidth: 800,
  },
  ColocalizationClassError: {
    plotID: "2",
    dataKey: "colocWithout11",
    description: "descriptive text",
    pageSubhead: "Colocalization class (only error classes)",
    containerWidth: 800,
  },
  r2VsH4ScatterPlot: {
    plotID: "3",
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    pageSubhead: "r² vs. h4 - all colocalizations jeff",
    containerHeight: 400,
    containerWidth: 400,
  },
  r2VsH4HeatMap: {
    plotID: "4",
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    pageSubhead: "r² vs. h4 - all colocalizations",
    containerHeight: 400,
    containerWidth: 500,
  },
  histogramH4: {
    plotID: "5",
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    pageSubhead: "Histogram of h4 - all colocalizations",
    containerHeight: 400,
    containerWidth: 400,
  },
  histogramR2: {
    plotID: "6",
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    pageSubhead: "Histogram of r2 - all colocalizations",
    containerHeight: 400,
    containerWidth: 400,
  },
  omicsCountsByGWAS: {
    plotID: "7",
    dataKey: "countsByOmics",
    description: "descriptive text",
    pageSubhead: "Count of %s QTL signals colocalized per GWAS",
    specCustom: {
      plotTitle: { key: "title.text", value: "Count of %s QTL signals colocalized per GWAS" },
      xTopTitle: { key: "vconcat[0].layer[0].encoding.x.title", value: "Count of %s QTL signals" },
      xBottomTitle: { key: "vconcat[1].layer[0].encoding.x.title", value: "Count of %s QTL signals" },
    },
    containerWidth: 800,
    plotWidth: 575,
  },
  omicsPropsByGWAS: {
    plotID: "8",
    dataKey: "countsByOmics",
    description: "descriptive text",
    pageSubhead: "Proportion of %s QTL signals colocalized per GWAS",
    specCustom: {
      plotTitle: { key: "title.text", value: "Proportion of %s QTL signals colocalized per GWAS" },
      xBottomTitle: { key: "vconcat[1].layer[0].encoding.x.title", value: "Proportion of %s QTL signals" },
    },
    containerWidth: 800,
    plotWidth: 575,
  },
  signalCountsPerGWAS: {
    plotID: "9",
    dataKey: "countsByGwas",
    description: "descriptive text",
    pageSubhead: "Count of signals per GWAS colocalized to at least 1 signal from %s",
    specCustom: {
      plotTitle: { key: "title.text", value: "Count of signals per GWAS colocalized to at least 1 signal from %s" },
    },
    containerWidth: 800,
    plotWidth: 575,
  },
}

export default VegaPlotConfig
