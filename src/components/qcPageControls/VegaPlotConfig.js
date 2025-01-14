/*
 * Note: Instead of recreating the whole plot each time the UI changes, in theory we could force a plot update.
 * In that case, the following key would be added to each config element.
 * However, couldn't get update to function reliably.
 *   dataName: "colocClassData",
 */

const VegaPlotConfig = {
  ColocalizationClass: {
    containerID: "plot01",
    dataKey: "recordsColocClass",
    description: "descriptive text",
    heading: "Plot 1: Colocalization class",
    width: 800,
  },
  ColocalizationClassError: {
    containerID: "plot02",
    dataKey: "recordsWithoutOneToOne",
    description: "descriptive text",
    heading: "Plot 2: Colocalization class (only error classes)",
    width: 800,
  },
  ColocalizationForStudy: {
    containerID: "plot03",
    dataKey: "recordsColocForStudy",
    description: "descriptive text",
    heading: "Plot 3: r² vs. h4 - all colocalizations",
    height: 400,
    width: 400,
  },
}

export default VegaPlotConfig
