export const r2VsH4ScatterPlotSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "height": "container",
  "width": "container",
  "title": {}, // value set programmatically
  "mark": "circle",
  "encoding": {
    "x": {
      "field": "coloc_h4",
      "type": "quantitative",
      "title": "Coloc H4"
    },
    "y": {
      "field": "r2",
      "type": "quantitative",
      "title": "r² between lead variants"
    }
  }
}
