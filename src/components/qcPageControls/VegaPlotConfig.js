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
    title: "Colocalization class",
    containerWidth: 800,
  },
  ColocalizationClassError: {
    plotID: "2",
    dataKey: "colocWithout11",
    description: "descriptive text",
    title: "Colocalization class (only error classes)",
    containerWidth: 800,
  },
  r2VsH4ScatterPlot: {
    plotID: "3",
    dataKey: "colocForStTi",
    description: "descriptive text",
    title: "r² vs. h4 - all colocalizations",
    containerHeight: 400,
    containerWidth: 400,
  },
  r2VsH4HeatMap: {
    plotID: "4",
    dataKey: "colocForStTi",
    description: "descriptive text",
    title: "r² vs. h4 - all colocalizations",
    containerHeight: 400,
    containerWidth: 500,
  },
  histogramH4: {
    plotID: "5",
    dataKey: "colocForStTi",
    description: "descriptive text",
    title: "Histogram of h4 - all colocalizations",
    containerHeight: 400,
    containerWidth: 400,
  },
  histogramR2: {
    plotID: "6",
    dataKey: "colocForStTi",
    description: "descriptive text",
    title: "Histogram of r2 - all colocalizations",
    containerHeight: 400,
    containerWidth: 400,
  },
  omicsByGWAS: {
    plotID: "7",
    dataKey: "countsByOmics",
    description: "descriptive text",
    title: "Count of %s QTL signals colocalized per GWAS",
    containerWidth: 800,
    plotWidth: 575,
  },
}

export default VegaPlotConfig
