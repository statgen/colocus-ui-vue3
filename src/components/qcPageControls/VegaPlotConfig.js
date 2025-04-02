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
    description:
      `Plot 1. Number of colocalized signals that have a one-to-one or a one-to-many colocalization
       for the same GWAS and molecular QTL.

       Ideally, for a colocalized signal pair, one GWAS trait signal will colocalize with one signal
       for a given molecular entity (such as a gene (eQTLs), or a methylation site (meQTLs)).
       When the fine-mapping quality is poor (or the sample size insufficient), a fine-mapped GWAS
       or molecular QTL signal may contain two (or more) unseparated signals. As a result,
       two molecular QTL or two GWAS signals, respectively, can colocalize with a single unseparated
       signal of the other trait. The presence of these signals can give a sense of the quality
       of the fine-mapping  (assuming these signals were not removed before submission of the data).`,
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
    description:
      `Proportion of colocalized signals with one-to-many mappings for a given GWAS and
       given molecular traits.
       See Plot 1 for a more extensive description.`,
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
    description: `Scatter plot of H4 colocalization quality and r2 between colocalized signals lead variants`,
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
    description: `Heatmap of H4 colocalization quality and r2 between colocalized signals lead variants`,
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
    description: `Histogram of colocalized signals H4`,
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
    description: `Histogram of r² between lead variant GWAS and molecular QTL signals for each colocalized signal`,
    plotTitle: "Histogram of r² - all colocalizations",
    plotTitleSize: FONT_SIZE.TITLE,
  },
  omicsCountsPerGWAS: {
    plotID: "10",
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
    description: "Number of {tissue} {molecular trait} QTLs colocalized with at least one GWAS signal.",
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
    plotID: "9",
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
    description: "Proportion of {tissue} {molecular trait} QTLs colocalized per GWAS",
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
    plotID: "8",
    barColors: {
      topTotal: { key: "vconcat[0]layer[0].mark.color", value: BAR_TERTIARY },
      topCount: { key: "vconcat[0]layer[1].mark.color", value: BAR_PRIMARY },
      bottomTotal: { key: "vconcat[1]layer[0].mark.color", value: BAR_TERTIARY },
      bottomCount: { key: "vconcat[1]layer[1].encoding.color.scale.range", value: [BAR_TERTIARY, BAR_PRIMARY] },
    },
    containerWidth: 800,
    dataKey: "countsByGwas",
    description: "Count of GWAS signals colocalized with at least 1 {tissue} {molecular trait}QTL and total GWAS signals",
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
    plotID: "7",
    barColors: {
      bar: { key: "layer[0].mark.color", value: BAR_PRIMARY }
    },
    containerWidth: 800,
    dataKey: "countsByGwas",
    description: "Proportion of GWAS signals colocalized to at least 1 {tissue} {molecular trait} QTL",
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
