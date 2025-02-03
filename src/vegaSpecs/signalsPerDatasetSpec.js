export const signalsPerDatasetSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "vconcat": [{
    "layer": [
      {
        "height": {"step": 22,},
        "mark": {
          "type": "bar",
          "color": "",  // supplied programmatically
        },
        "encoding": {
          "x": {
            "field": "count",
            "type": "quantitative",
            "title": "Number of signals",
            "stack": "zero"
          },
          "y": {
            "field": "dataset",
            "type": "ordinal",
            "sort": {
              "field": "count",
              "order": "descending"
            },
            "axis": {
              "titlePadding": 10,
              "labelPadding": 10,
              "labelLimit": 500,
              "ticks": false
            },
          },
          "tooltip": [
            {"field": "dataset", "title": "Dataset"},
            {"field": "count", "type": "ordinal", "title": "Count of signals"},
          ],
        },
      },
      {
        "mark": {
          "type": "text",
          "baseline": "middle",
          "fontSize": null,
          "fontWeight": "normal",
          "color": "black",
          "dx": 5
        },
        "encoding": {
          "x": {
            "field": "count",
            "type": "quantitative",
            "stack": "zero",
            "bandPosition": 0.5
          },
          "y": {
            "axis": {
              labelFontSize: null,
            },
            "field": "dataset",
            "type": "ordinal",
            "sort": {
              "field": "count",
              "order": "descending"
            },
          },
          "text": {
            "field": "count",
            "type": "quantitative",
            "format": ",d"
          },

        }
      }
    ],
  }]
}

