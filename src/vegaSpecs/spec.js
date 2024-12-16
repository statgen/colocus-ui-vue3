const spec1 = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "values": [] },  // 'records' must be a defined variable/array
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
            "titlePadding": 15,
            "labelPadding": 15,
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
          "title": "Colocalization class",
          "scale": {
            "domain": [
              "oneToOneSignal",
              "moreThanTwoGwasPerEqtlSignal",
              "moreThanTwoQtlPerGwasSignal"
            ],
            "range": ["#66c2a5", "#fc8d62", "#8da0cb"]
          },
          "legend": {
            "orient": "top",
            "title": "Colocalization class",
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
        "fontSize": 10,
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
  ],
  "config": {
    "view": {
      "continuousHeight": 600,
      "continuousWidth": 600
    }
  }
}

export default spec1
