export const r2VsH4HeatMapSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "height": "container",
  "width": "container",
  "title": {}, // set programmatically
  "mark": {
    "type": "rect",
  },
  "encoding": {
    "x": {
      "field": "coloc_h4",
      "bin": {"maxbins": 40},
      "type": "quantitative",
      "title": "Coloc H4",
      "scale": {"domain": [0, 1]}
    },
    "y": {
      "field": "r2",
      "bin": {"maxbins": 40},
      "type": "quantitative",
      "title": "r² between lead variants",
      "scale": {"domain": [0, 1]}
    },
    "color": {
      "aggregate": "count",
      "type": "quantitative",
      "scale": {
        "range": [], // set programmatically
      },
    },
    "tooltip": {
      "aggregate": "count"
    }
  },
}
