import _ from 'lodash'

const barLayer = {
  "mark": {
    "type": "bar",
    "color": "#8da0cb",
  },
  "encoding": {
    "x": {
      "field": "count",
      "type": "quantitative",
      "title": "",
    },
    "y": {
      "field": "row",
      "title": "",
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
      {"field": "count", "type": "quantitative", "title": "Count of colocalized OMICS signals", "format": ",d" },
      {"field": "total", "type": "quantitative", "title": "Total number of OMICS signals", "format": ",d" }
    ],
  },
}

const barLayerTopTotal = {
  "mark": {
    "type": "bar",
    "color": "lightgray",
  },
  "encoding": {
    "x": {
      "field": "total",
      "type": "quantitative",
      "title": "",
      "scale": {
        "nice": false
      }
    },
    "y": {
      "field": "row",
      "title": "",
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
      {"field": "count", "type": "quantitative", "title": "Count of colocalized OMICS signals", "format": ",d" },
      {"field": "total", "type": "quantitative", "title": "Total number of OMICS signals", "format": ",d" }
    ],
  },
}

const barLayerBottom = () => {
  const x = _.merge(_.cloneDeep(barLayer), {
    "height": { "step": 22, },
    "mark": {
      "color": "#8da0cb",
    },
    "title": {
      "text": ""
    },
    "encoding": {
      "x": {
        "title": "Number of colocalized ${filters.omics.study} signals",
      },
      "y": {
        "title": "GWAS analysis",
      }
    }
  })
  return x
}

const textLayer = {
  "mark": {
    "type": "text",
    "baseline": "middle",
    "fontSize": 14,
    "fontWeight": "normal",
    "color": "black",
    "dx": 3,
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
        "labelFontSize": 14,
      },
      "field": "row",
      "type": "ordinal",
      "sort": null
    },
    "text": {
      "field": "count",
      "type": "quantitative",
      "format": ",d"
    }
  }
}

const textLayerTotalTop = {
  "mark": {
    "type": "text",
    "baseline": "middle",
    "fontWeight": "normal",
    "color": "black",
    "dx": -15,
  },
  "encoding": {
    "x": {
      "field": "total",
      "type": "quantitative",
      "bandPosition": 0.5
    },
    "y": {
      "axis": {
        "labelFontSize": 14,
      },
      "field": "row",
      "type": "ordinal",
      "sort": null
    },
    "text": {
      "field": "total",
      "type": "quantitative",
      "format": ",d"
    }
  }
}

const omicsCountsByGWASSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "data": { "name": "placeholder", "values": [] },
  // "height": { "step": 22, },
  "title": {
    "text": "Count of ${filters.omics.study} QTL signals colocalized per GWAS",
    "offset": 10,
    "anchor": "start"
  },
  "vconcat": [
    {
      "transform": [{"filter": "datum.row == 'All GWAS'"}],
      "layer": [barLayerTopTotal, barLayer, textLayerTotalTop, textLayer],
      "width": 575,
    },
    {
      "transform": [{"filter": "datum.row != 'All GWAS'"}],
      "layer": [barLayerBottom(), textLayer],
      "width": 575,
    }
  ],
}

export { omicsCountsByGWASSpec }
