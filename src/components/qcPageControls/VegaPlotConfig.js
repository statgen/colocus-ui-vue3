const BAR_COLORS = {
  BAR_PRIMARY: "#8ef18f", //"#8da0cb",
  BAR_SECONDARY: "#ffd1c7", //"#D3D3D3",
  BAR_TERTIARY: "#dddddd", //"#fc8d62",
}

const VegaPlotConfig = {
  ColocalizationClass: {
    plotID: "1",
    dataKey: "colocClass",
    description: "descriptive text",
    plotTitle: "Colocalization class",
    containerWidth: 800,
    barColors: {
      // colorRange: { key: "layer[0].encoding.color.scale.range", value: ["#66c2a5", "#fc8d62", "#8da0cb"] }
      colorRange: { key: "layer[0].encoding.color.scale.range", value: [BAR_COLORS.BAR_PRIMARY, BAR_COLORS.BAR_TERTIARY, BAR_COLORS.BAR_SECONDARY] },
    },
  },
  ColocalizationClassError: {
    plotID: "2",
    dataKey: "colocWithout11",
    description: "descriptive text",
    plotTitle: "Colocalization class (only error classes)",
    containerWidth: 800,
    barColors: {
      colorRange: { key: "layer[0].encoding.color.scale.range", value: [BAR_COLORS.BAR_SECONDARY, BAR_COLORS.BAR_PRIMARY] }
    },
  },
  r2VsH4ScatterPlot: {
    plotID: "3",
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    plotTitle: "r² vs. h4 - all colocalizations",
    containerHeight: 400,
    containerWidth: 400,
    barColors: {
      color: { key: "mark.color", value: BAR_COLORS.BAR_PRIMARY }
    },
  },
  r2VsH4HeatMap: {
    plotID: "4",
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    plotTitle: "r² vs. h4 - all colocalizations",
    containerHeight: 400,
    containerWidth: 500,
    barColors: {
      colorRange: { key: "encoding.color.scale.range", value: [BAR_COLORS.BAR_TERTIARY, BAR_COLORS.BAR_PRIMARY] }
    },
  },
  histogramH4: {
    plotID: "5",
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    plotTitle: "Histogram of h4 - all colocalizations",
    containerHeight: 400,
    containerWidth: 400,
    barColors: {
      count: { key: "mark.color", value: BAR_COLORS.BAR_PRIMARY },
    },
  },
  histogramR2: {
    plotID: "6",
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    plotTitle: "Histogram of r² - all colocalizations",
    containerHeight: 400,
    containerWidth: 400,
    barColors: {
      count: { key: "mark.color", value: BAR_COLORS.BAR_PRIMARY },
    },
  },
  omicsCountsPerGWAS: {
    plotID: "7",
    dataKey: "countsByOmics",
    description: "descriptive text",
    plotTitle: "Count of %s QTL signals colocalized per GWAS",
    axisTitles: {
      xTopTitle: { key: "vconcat[0].layer[0]", value: "Count of %s QTL signals" },
      xBottomTitle: { key: "vconcat[1].layer[0]", value: "Count of %s QTL signals" },
    },
    containerWidth: 800,
    plotWidth: 575,
    barColors: {
      topTotal: { key: "vconcat[0]layer[0].mark.color", value: BAR_COLORS.BAR_TERTIARY },
      topCount: { key: "vconcat[0]layer[1].mark.color", value: BAR_COLORS.BAR_PRIMARY },
      bottomCount: { key: "vconcat[1]layer[0].mark.color", value: [BAR_COLORS.BAR_PRIMARY] },
    },
  },
  omicsPropsPerGWAS: {
    plotID: "8",
    dataKey: "countsByOmics",
    description: "descriptive text",
    plotTitle: "Proportion of %s QTL signals colocalized per GWAS",
    axisTitles: {
      xTopTitle: { key: "vconcat[0].layer[0]", value: "Proportion of %s QTL signals" },
      xBottomTitle: { key: "vconcat[1].layer[0]", value: "Proportion of %s QTL signals" },
    },
    containerWidth: 800,
    plotWidth: 575,
    barColors: {
      topProp: { key: "vconcat[0]layer[0].mark.color", value: BAR_COLORS.BAR_PRIMARY },
      bottomProp: { key: "vconcat[1]layer[0].mark.color", value: BAR_COLORS.BAR_PRIMARY },
    },
  },
  signalCountsPerGWAS: {
    plotID: "9",
    dataKey: "countsByGwas",
    description: "descriptive text",
    plotTitle: "Count of signals per GWAS colocalized to at least 1 signal from %s",
    containerWidth: 800,
    plotWidth: 575,
    barColors: {
      topTotal: { key: "vconcat[0]layer[0].mark.color", value: BAR_COLORS.BAR_TERTIARY },
      topCount: { key: "vconcat[0]layer[1].mark.color", value: BAR_COLORS.BAR_PRIMARY },
      bottomTotal: { key: "vconcat[1]layer[0].mark.color", value: BAR_COLORS.BAR_TERTIARY },
      bottomCount: { key: "vconcat[1]layer[1].encoding.color.scale.range", value: [BAR_COLORS.BAR_TERTIARY, BAR_COLORS.BAR_PRIMARY] },
    },
  },
  signalPropsPerGWAS: {
    plotID: "10",
    dataKey: "countsByGwas",
    description: "descriptive text",
    plotTitle: "Proportion of signals per GWAS colocalized to at least 1 signal from %s",
    containerWidth: 800,
    barColors: {
      bar: { key: "layer[0].mark.color", value: BAR_COLORS.BAR_PRIMARY }
    },
  },
  signalsPerDataset: {
    plotID: "11",
    dataKey: "signalsPerDataset",
    description: "descriptive text",
    plotTitle: "Number of total signals per dataset",
    containerWidth: 800,
    plotWidth: 575,
    barColors: {
      bar: { key: "vconcat[0].layer[0].mark.color", value: BAR_COLORS.BAR_PRIMARY }
    },
  },
}

export default VegaPlotConfig
