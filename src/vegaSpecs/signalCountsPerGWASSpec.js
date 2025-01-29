import _ from 'lodash'

let barLayers = [
  {
    "mark": {
      "type": "bar",
      "color": "",  // set programmatically
    },
    "encoding": {
      "x": {
        "field": "total",
        "type": "quantitative",
        "title": "Count of signals",
        "scale": {
          "nice": false
        },
        "stack": "null",
      },
      "y": {
        "field": "row",
        "title": "GWAS analysis",
        "type": "ordinal",
        "sort": null,
        "axis": {
          "labelFontSize": 14,
          "titlePadding": 15,
          "labelPadding": 15,
          "ticks": false
        },
      },
      "tooltip": [
        {"field": "row", "title": "GWAS analysis"},
        {"field": "count", "type": "quantitative", "title": "Count of GWAS signals" },
        {"field": "total", "type": "quantitative", "title": "Total GWAS signals"},
        {"field": "prop", "type": "quantitative", "title": "Proportion of GWAS signals", "format": "0.1%"}
      ],
    },
  },
  {
    "mark": {
      "type": "bar",
      "color": "", // set programmatically
    },
    "title": {}, // set programmatically
    "encoding": {
      "x": {
        "field": "count",
        "type": "quantitative",
      },
      "y": {
        "field": "row",
        "title": "GWAS analysis",
        "type": "ordinal",
        "sort": null,
        "axis": {
          "titlePadding": 15,
          "labelPadding": 15,
          "ticks": false
        },
      },
      "tooltip": [
        {"field": "row", "title": "GWAS analysis"},
        {"field": "count", "type": "quantitative", "title": "Count of GWAS signals" },
        {"field": "total", "type": "quantitative", "title": "Total GWAS signals"},
        {"field": "prop", "type": "quantitative", "title": "Proportion of GWAS signals", "format": "0.1%"}
      ],
    },
  }
];

let textLayers = [
  {
    "mark": {
      "type": "text",
      "baseline": "middle",
      "fontSize": 14,
      "fontWeight": "normal",
      "color": "black",
    },
    "encoding": {
      "x": {
        "field": "count",
        "type": "quantitative",
        "stack": "zero",
        "bandPosition": 0.5
      },
      "y": {
        "field": "row",
        "type": "ordinal",
        "sort": null
      },
      "text": {
        "field": "count",
        "type": "quantitative",
        "format": ",d"
      },

    }
  },
  {
    "mark": {
      "type": "text",
      "baseline": "middle",
      "fontSize": 14,
      "fontWeight": "normal",
      "color": "black",
    },
    "encoding": {
      "x": {
        "field": "total",
        "type": "quantitative",
        "stack": "zero",
        "bandPosition": 0.5
      },
      "y": {
        "field": "row",
        "type": "ordinal",
        "sort": null
      },
      "text": {
        "field": "total",
        "type": "quantitative",
        "format": ",d"
      },

    }
  }
];

const barLayersTop = () => {
  const x = _.merge(_.cloneDeep(barLayers), [
    {
      "encoding": {
        "y": {
          "title": ""
        }
      }
    },
    {
      "encoding": {
        "y": {
          "title": ""
        }
      }
    }
  ])
  return x
}

const barLayersBot = () => {
  const x = _.merge(_.cloneDeep(barLayers), [
    {
      "height": { "step": 22, },
      // This part makes it so that the total bars on the bottom half of the plot don't go the entire full length
      // Otherwise by default it "nicely" rounds up the scale bound
      "encoding": {
        "x": {
          "scale": {
            "nice": true
          }
        }
      }
    },
    {
      "encoding": {
        "color": {
          "field": "Type",
          "type": "nominal",
          "scale": {
            "domain": ["Total", "Count"],
            "range": [],  // set programmatically
          },
          "title": "",
        }
      },
    }
  ])
  return x
}

let signalCountsPerGWASSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "width": "container",
  "title": {}, // set programmatically
  "vconcat": [
    {
      "transform": [{"filter": "datum.row === 'All GWAS'"}],
      "layer": [...barLayersTop(), ...textLayers]
    },
    {
      "transform": [
        {"filter": "datum.row !== 'All GWAS'"},
        {"calculate": "'Total'", "as": "Type"},
        {"calculate": "'Count'", "as": "Type"}
      ],
      "layer": [...barLayersBot(), ...textLayers]
    }
  ],
}

export { signalCountsPerGWASSpec }
