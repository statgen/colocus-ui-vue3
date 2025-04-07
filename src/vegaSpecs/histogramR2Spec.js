export const histogramR2Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v6.json",
  "data": { "name": "placeholder", "values": [] },
  "height": "container",
  "width": "container",
  "title": {},
  "mark": {
    "type": "bar",
    "color": "",
  },
  "encoding": {
    "x": {
      "bin": true,
      "field": "r2",
      "title": "r²"
    },
    "y": {
      "aggregate": "count",
      "axis": {
        "titlePadding": 10,
      },
    }
  },
}
