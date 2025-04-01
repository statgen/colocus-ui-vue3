import { COLORS } from '@/constants'

const FONT_SIZE = {
  LABEL: 14,
  LEGEND: 12,
  MARK: 14,
  TITLE: 18,
}

const { BAR_PRIMARY, BAR_SECONDARY, BAR_TERTIARY } = COLORS

const VegaPlotConfig = {
  ColocalizationClass: {
    plotID: "1",
    barColors: {
      colorRange: { key: "layer[0].encoding.color.scale.range", value: [BAR_PRIMARY, BAR_TERTIARY, BAR_SECONDARY] },
    },
    containerWidth: 800,
    dataKey: "colocClass",
    description: "descriptive text",
    fontSizes: {
      "layer[0].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
      "layer[0].encoding.color.legend.labelFontSize": FONT_SIZE.LEGEND,
      "layer[1].mark.fontSize": FONT_SIZE.MARK,
    },
    plotTitle: "Colocalization class",
    plotTitleSize: FONT_SIZE.TITLE,
  },
  ColocalizationClassError: {
    plotID: "2",
    barColors: {
      colorRange: { key: "layer[0].encoding.color.scale.range", value: [BAR_SECONDARY, BAR_PRIMARY] }
    },
    containerWidth: 800,
    dataKey: "colocWithout11",
    description: "descriptive text",
    fontSizes: {
      "layer[0].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
      "layer[0].encoding.color.legend.labelFontSize": FONT_SIZE.LEGEND,
      "layer[1].mark.fontSize": FONT_SIZE.MARK,
    },
    plotTitle: "Colocalization class (only error classes)",
    plotTitleSize: FONT_SIZE.TITLE,
  },
  r2VsH4ScatterPlot: {
    plotID: "3",
    barColors: {
      color: { key: "mark.color", value: BAR_PRIMARY }
    },
    containerHeight: 400,
    containerWidth: 400,
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    plotTitle: "r² vs. h4 - all colocalizations",
    plotTitleSize: FONT_SIZE.TITLE,
  },
  r2VsH4HeatMap: {
    plotID: "4",
    barColors: {
      colorRange: { key: "encoding.color.scale.range", value: [BAR_TERTIARY, BAR_PRIMARY] }
    },
    containerHeight: 400,
    containerWidth: 500,
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    plotTitle: "r² vs. h4 - all colocalizations",
    plotTitleSize: FONT_SIZE.TITLE,
  },
  histogramH4: {
    plotID: "5",
    barColors: {
      count: { key: "mark.color", value: BAR_PRIMARY },
    },
    containerHeight: 400,
    containerWidth: 400,
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    plotTitle: "Histogram of h4 - all colocalizations",
    plotTitleSize: FONT_SIZE.TITLE,
  },
  histogramR2: {
    plotID: "6",
    barColors: {
      count: { key: "mark.color", value: BAR_PRIMARY },
    },
    containerHeight: 400,
    containerWidth: 400,
    dataKey: "colocWithStTiH4R2",
    description: "descriptive text",
    plotTitle: "Histogram of r² - all colocalizations",
    plotTitleSize: FONT_SIZE.TITLE,
  },
  omicsCountsPerGWAS: {
    plotID: "7",
    axisTitles: {
      xTopTitle: { key: "vconcat[0].layer[0]", value: "Count of %s QTL signals" },
      xBottomTitle: { key: "vconcat[1].layer[0]", value: "Count of %s QTL signals" },
    },
    barColors: {
      topTotal: { key: "vconcat[0]layer[0].mark.color", value: BAR_TERTIARY },
      topCount: { key: "vconcat[0]layer[1].mark.color", value: BAR_PRIMARY },
      bottomCount: { key: "vconcat[1]layer[0].mark.color", value: [BAR_PRIMARY] },
    },
    containerWidth: 800,
    dataKey: "countsByOmics",
    description: "descriptive text",
    fontSizes: {
      "vconcat[0].layer[3].mark.fontSize": FONT_SIZE.MARK,
      "vconcat[0].layer[3].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
      "vconcat[1].layer[1].mark.fontSize" : FONT_SIZE.MARK,
      "vconcat[1].layer[1].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
      "vconcat[0].layer[2].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
    },
    plotTitle: "Count of %s QTL signals colocalized per GWAS",
    plotTitleSize: FONT_SIZE.TITLE,
    plotWidth: 575,
  },
  omicsPropsPerGWAS: {
    plotID: "8",
    axisTitles: {
      xTopTitle: { key: "vconcat[0].layer[0]", value: "Proportion of %s QTL signals" },
      xBottomTitle: { key: "vconcat[1].layer[0]", value: "Proportion of %s QTL signals" },
    },
    barColors: {
      topProp: { key: "vconcat[0]layer[0].mark.color", value: BAR_PRIMARY },
      bottomProp: { key: "vconcat[1]layer[0].mark.color", value: BAR_PRIMARY },
    },
    containerWidth: 800,
    dataKey: "countsByOmics",
    description: "descriptive text",
    fontSizes: {
      "vconcat[0].layer[1].mark.fontSize": FONT_SIZE.MARK,
      "vconcat[1].layer[1].mark.fontSize": FONT_SIZE.MARK,
      "vconcat[0].layer[1].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
      "vconcat[1].layer[1].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
    },
    plotTitle: "Proportion of %s QTL signals colocalized per GWAS",
    plotTitleSize: FONT_SIZE.TITLE,
    plotWidth: 575,
  },
  signalCountsPerGWAS: {
    plotID: "9",
    barColors: {
      topTotal: { key: "vconcat[0]layer[0].mark.color", value: BAR_TERTIARY },
      topCount: { key: "vconcat[0]layer[1].mark.color", value: BAR_PRIMARY },
      bottomTotal: { key: "vconcat[1]layer[0].mark.color", value: BAR_TERTIARY },
      bottomCount: { key: "vconcat[1]layer[1].encoding.color.scale.range", value: [BAR_TERTIARY, BAR_PRIMARY] },
    },
    containerWidth: 800,
    dataKey: "countsByGwas",
    description: "descriptive text",
    fontSizes: {
      "vconcat[0].layer[0].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
      "vconcat[1].layer[0].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
      "vconcat[0].layer[2].mark.fontSize": FONT_SIZE.MARK,
      "vconcat[0].layer[3].mark.fontSize": FONT_SIZE.MARK,
      "vconcat[1].layer[2].mark.fontSize": FONT_SIZE.MARK,
      "vconcat[1].layer[3].mark.fontSize": FONT_SIZE.MARK,
    },
    plotTitle: "Count of signals per GWAS colocalized to at least 1 signal from %s",
    plotTitleSize: FONT_SIZE.TITLE,
    plotWidth: 575,
  },
  signalPropsPerGWAS: {
    plotID: "10",
    barColors: {
      bar: { key: "layer[0].mark.color", value: BAR_PRIMARY }
    },
    containerWidth: 800,
    dataKey: "countsByGwas",
    description: "descriptive text",
    fontSizes: {
      "layer[0].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
      "layer[1].mark.fontSize": FONT_SIZE.MARK,
      "layer[2].mark.fontSize": FONT_SIZE.MARK,
    },
    plotTitle: "Proportion of signals per GWAS colocalized to at least 1 signal from %s",
    plotTitleSize: FONT_SIZE.TITLE,
  },
  signalsPerDataset: {
    plotID: "11",
    barColors: {
      bar: { key: "vconcat[0].layer[0].mark.color", value: BAR_PRIMARY }
    },
    containerWidth: 800,
    dataKey: "signalsPerDataset",
    description: "descriptive text",
    fontSizes: {
      "vconcat[0].layer[1].mark.fontSize": FONT_SIZE.MARK,
      "vconcat[0].layer[1].encoding.y.axis.labelFontSize": FONT_SIZE.LABEL,
    },
    plotTitle: "Number of total signals per dataset",
    plotTitleSize: FONT_SIZE.TITLE,
    plotWidth: 575,
  },
}

export default VegaPlotConfig
