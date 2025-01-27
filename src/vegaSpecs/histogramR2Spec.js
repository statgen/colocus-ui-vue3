export const histogramR2Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "height": "container",
  "width": "container",
  "title": {}, // value set programmatically
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
