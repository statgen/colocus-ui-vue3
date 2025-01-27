export const signalPropsPerGWASSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "height": { "step": 22, }, // for bar charts only, else
  "width": "container",
  "layer": [
    {
      "mark": {
        "type": "bar",
        "color": "#8da0cb",
      },
      "title": {
        "fontSize": 16,
        "offset": 10,
        "anchor": "start"
      },
      "encoding": {
        "x": {
          "field": "prop",
          "type": "quantitative",
          "title": `Proportion of GWAS signals`,
          "stack": "zero",
        },
        "y": {
          "field": "row",
          "title": "GWAS analysis",
          "type": "nominal",
          "sort": {"field": "prop", "order": "descending"},
          "axis": {
            labelFontSize: 14,
            "titlePadding": 15,
            "labelPadding": 15,
            "ticks": false
          },
        },
        "tooltip": [
          {"field": "row", "title": "GWAS analysis"},
          {"field": "prop", "type": "quantitative", "title": "Proportion of GWAS signals", "format": ".1%" },
        ],
      },
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
          "field": "prop",
          "type": "quantitative",
          "stack": "zero",
          "bandPosition": 0.5
        },
        "y": {
          "field": "row",
          "type": "ordinal",
          "sort": {"field": "prop", "order": "descending"},
        },
        "text": {
          "field": "prop",
          "type": "quantitative",
          "format": ".1%"
        },

      }
    }
  ],
}
