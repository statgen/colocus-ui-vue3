// Getting the stacked bars to sort correctly is currently a hack: https://github.com/vega/vega-lite/issues/1734#issuecomment-533223530
export const colocClassErrorSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "height": { "step": 22, },
  "width": "container",
  "title": {}, // value set programmatically
  "transform": [
    {"filter": "datum.value > 0"},
  ],
  "layer": [
    {
      "mark": {
        "type": "bar",
      },
      "encoding": {
        "x": {
          "field": "propOfGwas",
          "type": "quantitative",
          "title": "Percentage of colocalizations",
          "stack": "zero"
        },
        "y": {
          "field": "gwasAnalysis",
          "title": "GWAS analysis",
          "type": "ordinal",
          "sort": {
            "field": "propOfGwas",
            "order": "descending"
          },
          "axis": {
            "labelFontSize": 14,
            "labelPadding": 15,
            "ticks": false
          },
        },
        "order": {
          "field": "sortIndex",
          "type": "quantitative",
        },
        "color": {
          "field": "variable",
          "type": "ordinal",
          "scale": {
            "domain": [
              "moreThanTwoGwasPerEqtlSignal",
              "moreThanTwoQtlPerGwasSignal",
            ],
            "range": ["#fc8d62", "#8da0cb"]
          },
          "legend": {
            "labelFontSize": 12,
            "orient": "top",
            "title": "",
            "labelExpr": "datum.label === 'moreThanTwoGwasPerEqtlSignal' ? 'QTL variant has 2+ GWAS signals' : " +
              "datum.label === 'moreThanTwoQtlPerGwasSignal' ? 'GWAS variant has 2+ QTL signals' : " +
              "datum.label === 'oneToOneSignal' ? 'One-to-one GWAS:eQTL signal' : datum.label"
          }
        },
        "tooltip": [
          {"field": "gwasAnalysis", "title": "GWAS analysis"},
          {"field": "variableLabel", "type": "ordinal", "title": "Colocalization type" },
          {"field": "value", "type": "quantitative", "title": "Number of colocalizations"},
          {"field": "propOfGwas", "type": "quantitative", "title": "Proportion of colocalizations for GWAS"}
        ],
      },
    },
    {
      "mark": {
        "type": "text",
        "baseline": "middle",
        "fontSize": 14,
        "fontWeight": "normal",
        "color": "black"
      },
      "encoding": {
        "x": {
          "field": "propOfGwas",
          "type": "quantitative",
          "stack": "zero",
          "bandPosition": 0.5
        },
        "y": {
          "field": "gwasAnalysis",
          "type": "ordinal",
          "sort": {
            "field": "propOfGwas",
            "order": "descending"
          },
        },
        "order": {
          "field": "sortIndex",
          "type": "quantitative",
        },
        "text": {
          "field": "propOfGwas",
          "type": "quantitative",
          "format": ".1%"
        },
      }
    }
  ],
}
