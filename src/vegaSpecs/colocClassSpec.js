export const colocClassSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "height": { "step": 22, },
  "width": "container",
  "title": {},
  "transform": [
    { "filter": "datum.value > 0" }
  ],
  "layer": [
    {
      "mark": { "type": "bar" },
      "encoding": {
        "x": {
          "field": "value",
          "type": "quantitative",
          "title": "Number of colocalizations",
          "stack": "zero"
        },
        "y": {
          "field": "gwasAnalysis",
          "title": "GWAS analysis",
          "type": "ordinal",
          "sort": null,
          "axis": {
            "labelFontSize": null,
            "titlePadding": 10,
            "labelPadding": 10,
            "ticks": false
          }
        },
        "order": {
          "field": "sortIndex",
          "type": "quantitative"
        },
        "color": {
          "field": "variable",
          "type": "ordinal",
          "scale": {
            "domain": [
              "oneToOneSignal",
              "moreThanTwoGwasPerEqtlSignal",
              "moreThanTwoQtlPerGwasSignal"
            ],
            "range": [],
          },
          "legend": {
            "labelFontSize": null,
            "orient": "top",
            "title": "",
            "labelExpr": "datum.label === 'moreThanTwoGwasPerEqtlSignal' ? 'QTL variant has 2+ GWAS signals' : datum.label === 'moreThanTwoQtlPerGwasSignal' ? 'GWAS variant has 2+ QTL signals' : datum.label === 'oneToOneSignal' ? 'One-to-one GWAS:eQTL signal' : datum.label"
          }
        },
        "tooltip": [
          { "field": "gwasAnalysis", "title": "GWAS analysis" },
          { "field": "variableLabel", "type": "ordinal", "title": "Colocalization type" },
          { "field": "value", "type": "quantitative", "title": "Number of colocalizations" }
        ]
      }
    },
    {
      "mark": {
        "type": "text",
        "baseline": "middle",
        "fontSize": null,
        "fontWeight": "normal",
        "color": "black"
      },
      "encoding": {
        "x": {
          "field": "value",
          "type": "quantitative",
          "stack": "zero",
          "bandPosition": 0.5
        },
        "y": {
          "field": "gwasAnalysis",
          "type": "ordinal",
          "sort": null
        },
        "order": {
          "field": "sortIndex",
          "type": "quantitative"
        },
        "text": {
          "field": "value",
          "type": "quantitative"
        }
      }
    }
  ]
}
