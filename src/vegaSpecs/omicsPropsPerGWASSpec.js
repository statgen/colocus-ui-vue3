import _ from 'lodash'

let barLayer = {
  "mark": {
    "type": "bar",
    "color": "#8da0cb",
  },
  "encoding": {
    "x": {
      "field": "prop",
      "type": "quantitative",
      "title": "placeholder",
      "stack": "zero",
      "scale": {
        "nice": false
      }
    },
    "y": {
      "field": "row",
      "type": "ordinal",
      "title": "",
      "sort": null,
      "axis": {
        "titlePadding": 10,
        "labelPadding": 10,
        "ticks": false
      },
    },
    "tooltip": [
      {"field": "row", "title": "GWAS analysis"},
      {"field": "prop", "type": "quantitative", "title": "Proportion of colocalized OMICS signals", "format": ".1%" },
    ],
  }
};

let textLayer =
  {
    "mark": {
      "type": "text",
      "baseline": "middle",
      "fontSize": null,
      "fontWeight": "normal",
      "color": "black",
      "dx": 10
    },
    "encoding": {
      "x": {
        "field": "prop",
        "type": "quantitative",
        "stack": "zero",
        "bandPosition": 0.5
      },
      "y": {
        "axis": {
          "labelFontSize": null,
        },
        "field": "row",
        "type": "ordinal",
        "sort": null
      },
      "text": {
        "field": "prop",
        "type": "quantitative",
        "format": ".1%"
      },

    }
  };

let barLayerBottom = () => {
  const x = _.merge(_.cloneDeep(barLayer), {
    "encoding": {
      "y": {
        "title": "GWAS analysis",
      },
      "x": {
        "scale": {
          "nice": true
        }
      }
    }
  })
  return x
}

let omicsPropsPerGWASSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  "title": {},
  "vconcat": [
    {
      "transform": [{"filter": "datum.row == 'All GWAS'"}],
      "layer": [barLayer, textLayer]
    },
    {
      "transform": [{"filter": "datum.row != 'All GWAS'"}],
      "layer": [barLayerBottom(), textLayer]
    }
  ],
}

export { omicsPropsPerGWASSpec }
