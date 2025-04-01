export const signalPropsPerGWASSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "height": { "step": 22, },
  "width": "container",
  "transform": [
    {
      "calculate": "format(datum.count, ',') + ' / ' + format(datum.total, ',')",
      "as": "count_total_label"
    },
    {
      "calculate": "length(datum.count_total_label) * 5", // dynamically calculate xOffset from length of label for each bar
      "as": "dynamic_offset"
    }
  ],
  "layer": [
    {
      "mark": {
        "type": "bar",
        "color": "",  // supplied programmatically
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
            labelFontSize: null,
            "titlePadding": 10,
            "labelPadding": 10,
            "ticks": false
          },
        },
        "tooltip": [
          {"field": "row", "title": "GWAS analysis"},
          {"field": "prop", "type": "quantitative", "title": "Proportion of GWAS signals", "format": ".1%" },
          {"field": "count", "type": "quantitative", "title": "Number of GWAS signals"},
          {"field": "total", "type": "quantitative", "title": "Total number of GWAS signals"}
        ],
      },
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
    },
    {
      "mark": {
        "type": "text",
        "baseline": "middle",
        "fontSize": null,
        "fontWeight": "normal",
        "color": "black",
        "xOffset": {"field": "dynamic_offset"},
      },
      "encoding": {
        "x": {
          "field": "prop",
          "type": "quantitative",
          "bandPosition": 1
        },
        "y": {
          "field": "row",
          "type": "ordinal",
          "sort": {"field": "prop", "order": "descending"},
        },
        "text": {
          "field": "count_total_label",
          "type": "nominal"
        }
      }
    }
  ],
}
