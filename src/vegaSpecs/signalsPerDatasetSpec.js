export const signalsPerDatasetSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "vconcat": [{
    "layer": [
      {
        "height": {"step": 22,},
        "mark": {
          "type": "bar",
          "color": "#8da0cb",
        },
        "title": {
          "subtitlePadding": 10,
          "fontSize": 16,
          "offset": 10,
          "anchor": "start"
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
            "title": false,
            "sort": {
              "field": "count",
              "order": "descending"
            },
            "axis": {
              "titlePadding": 15,
              "labelPadding": 15,
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
          "fontSize": 10,
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
              labelFontSize: 14,
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

