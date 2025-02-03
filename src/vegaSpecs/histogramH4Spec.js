export const histogramH4Spec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
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
      "field": "coloc_h4",
      "title": "Coloc H4"
    },
    "y": {
      "aggregate": "count",
      "axis": {
        "titlePadding": 10,
      },
    }
  },
}
