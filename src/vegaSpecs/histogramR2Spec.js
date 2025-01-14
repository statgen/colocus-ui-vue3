export const histogramR2Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "height": "container",
  "width": "container",
  "title": {
    "text": "Histograms of r² and H4 - All colocalizations",
    "anchor": "start",
    "fontSize": 16,
    "offset": 10
  },
  "mark": "bar",
  "encoding": {
    "x": {
      "bin": true,
      "field": "r2",
      "title": "r²"
    },
    "y": {
      "aggregate": "count"
    }
  },
}
