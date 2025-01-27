export const histogramH4Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "height": "container",
  "width": "container",
  "title": {
    "text": "Histogram of H4 - All colocalizations",
    "anchor": "start",
    "fontSize": 16,
    "offset": 10
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "bin": true,
      "field": "coloc_h4",
      "title": "Coloc H4"
    },
    "y": {
      "aggregate": "count"
    }
  },
}
