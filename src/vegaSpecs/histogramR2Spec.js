export const histogramR2Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "height": "container",
  "width": "container",
  "title": {}, // set programmatically
  "mark": {
    "type": "bar",
    "color": "", // set programmatically
  },
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
