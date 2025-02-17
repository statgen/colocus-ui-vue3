import LocusZoom from 'locuszoom';
import { parseMarker } from 'locuszoom/esm/helpers/parse';
import { deepCopy, merge } from 'locuszoom/esm/helpers/layouts';
import { URLS } from '@/constants';

function _get_assoc_id(name) {
  return `assoc_${name}`;
}

/**
 * Function for use with LZ data_operations to remove records with null values.
 * Does not check for NaN or other possible bad values - strictly checks against null.
 * @param context Contains {plot_state: ..., data_layer: ...}
 * @param recordsets List of record sets; this function expects only one record set to be present in the list
 * @param field Which field to filter on, e.g. 'assoc:pvalue'
 * @returns {*[]}
 */
function filter_null(context, recordsets, field) {
  const arr = [];
  if (recordsets.length > 1) {
    throw new Error('filter_null expects only one record set');
  }
  for (const e of recordsets[0]) {
    if (e[field] !== null) {
      arr.push(e);
    }
  }
  return arr;
}
LocusZoom.DataFunctions.add('filter_null', filter_null);

/**
 * Turn a list of data source configs into an LZ.DataSources object
 * @param {Object[]} source_configs
 * @return {module:LocusZoom.DataSources|module:LocusZoom.DataSources}
 */
function config_to_sources(source_configs) {
  const data_sources = new LocusZoom.DataSources();
  source_configs.forEach(([name, config]) => {
    if (!data_sources.has(name)) {
      data_sources.add(name, config);
    }
  });
  return data_sources;
}

// Define a TEMPORARY data source until api is working
const base = LocusZoom.Adapters.get('BaseLZAdapter');

/**
 * An adapter that queries payloads from region-based endpoints such as trait/conditioned signal
 * @type {ColocRegionAdapter}
 */
const ColocRegionAdapter = class extends base {
  _getURL(request_options) {
    const { chr, start, end } = request_options;
    const base = super._getURL(request_options);
    return `${base}?chrom=${chr}&start=${start}&end=${end}`;
  }

  _annotateRecords(records, options) {
    return records.filter((item) => {
      return (item.t1_neg_log_pvalue !== 'Infinity') &&
             (item.t2_neg_log_pvalue !== 'Infinity');
    });
  }
};

// const LDServer = LocusZoom.Adapters.get('LDServer');
const ColocLDAdapter = class extends ColocRegionAdapter {
  // LD region requests need a little extra help to deal with reference variant in queries
  constructor(config) {
    if (!config.limit_fields) {
      config.limit_fields = ['variant2', 'position2', 'correlation'];
    }
    super(config);
  }

  _getURL(request_options) {
    const base = super._getURL(request_options);
    return `${base}&variant=${request_options.ld_refvar}`;
  }

  _getCacheKey(options) {
    // LD is keyed by more than just region; append other parameters to the base cache key
    const base = super._getCacheKey(options);
    const { ld_refvar } = options;
    return `${base}_${ld_refvar}`;
  }

  _buildRequestOptions(state, assoc_data) {
    if (!assoc_data) {
      throw new Error('LD request must depend on association data');
    }
    // If no state refvar is provided, find the most significant variant in any provided assoc data.
    //   Assumes that assoc satisfies the "assoc" fields contract, eg has fields variant and log_pvalue
    const base = super._buildRequestOptions(...arguments);
    if (!assoc_data.length) {
      base._skip_request = true;
      return base;
    }

    base.ld_refvar = this.__find_ld_refvar(state, assoc_data);
    return base;
  }

  __findPrefixedKey(a_record, fieldname) {
    // relax the normal rules because in this app there are multiple log_pvalue fields (we join two datasets into a single query)
    // First field... usually t1 because of serialization order, might be unstable/ buggy in wild edge cases?
    const match = Object.keys(a_record).find((key) => fieldname.endsWith(key));
    if (!match) {
      throw new Error(`Could not locate the required key name: ${fieldname} in dependent data`);
    }
    return match;
  }

  __find_ld_refvar(state, assoc_data) {
    // TODO deduplicate- LD adapter is super restrictive and that causes problems with two datasets in one request

    const assoc_variant_name = this._findPrefixedKey(assoc_data[0], 'variant');
    const assoc_logp_name = this._findPrefixedKey(assoc_data[0], 't2_neg_log_pvalue');

    // Determine the reference variant (via user selected OR automatic-per-track)
    let refvar;
    let best_hit = {};
    if (state.ldrefvar) {
      // State/ldrefvar would store the variant in the format used by assoc data, so no need to clean up to match in data
      refvar = state.ldrefvar;
      best_hit = assoc_data.find((item) => item[assoc_variant_name] === refvar) || {};
    } else {
      // find highest log-value and associated var spec
      let best_logp = 0;
      for (const item of assoc_data) {
        const { [assoc_variant_name]: variant, [assoc_logp_name]: log_pvalue } = item;
        if (log_pvalue > best_logp) {
          best_logp = log_pvalue;
          refvar = variant;
          best_hit = item;
        }
      }
    }

    // Add a special field that is not part of the assoc or LD data from the server, but has significance for plotting.
    //  Since we already know the best hit, it's easier to do this here rather than in annotate or join phase.
    best_hit.lz_is_ld_refvar = true;

    // Above, we compared the ldrefvar to the assoc data. But for talking to the LD server,
    //   the variant fields must be normalized to a specific format. All later LD operations will use that format.
    const match = parseMarker(refvar, true);
    if (!match) {
      throw new Error('Could not request LD for a missing or incomplete marker format');
    }

    const [chrom, pos, ref, alt] = match;
    // Currently, the LD server only accepts full variant specs; it won't return LD w/o ref+alt. Allowing
    //  a partial match at most leaves room for potential future features.
    refvar = `${chrom}:${pos}`; // FIXME: is this a server request that we can skip?
    if (ref && alt) {
      refvar += `_${ref}/${alt}`;
    }

    const coord = +pos;
    // Last step: sanity check the proposed reference variant. Is it inside the view region? If not, we're probably
    //  remembering a user choice from before user jumped to a new region. LD should be relative to something nearby.
    if ((coord && state.ldrefvar && state.chr) && (chrom !== String(state.chr) || coord < state.start || coord > state.end)) {
      // Rerun this method, after clearing out the proposed reference variant. NOTE: Adapter call receives a
      //   *copy* of plot.state, so wiping here doesn't remove the original value.
      state.ldrefvar = null;
      return this.__find_ld_refvar(state, assoc_data);
    }

    // Return the reference variant, in a normalized format suitable for LDServer queries
    return refvar;
  }

  _performRequest(options) {
    // Skip request if this one depends on other data, and we are in a region with no data
    if (options._skip_request) {
      return Promise.resolve([]);
    }
    return super._performRequest(options);
  }

  _annotateRecords(records, options) {
    // A single PLINK LD file could contain several reference variants (SNP_A) in the same region.
    //   Only show LD relative to the user-selected refvar in this plot.
    return records.filter((item) => item.variant1 === options.ld_refvar);
  }
};

LocusZoom.Adapters.add('ColocRegionAdapter', ColocRegionAdapter);
LocusZoom.Adapters.add('ColocLDAdapter', ColocLDAdapter);

LocusZoom.Layouts.add('plot', 'locuscompare', {
  width: 500,
  responsive_resize: true,
  min_region_scale: 20000,
  max_region_scale: 1000000,
  toolbar: {
    widgets: [
      {
        type: 'download',
        position: 'right',
        group_position: 'end',
      },
      {
        type: 'download_png',
        position: 'right',
        group_position: 'start',
      },
    ]
  },
  panels: [
    {
      id: 'locuscompare',
      tag: 'locuscompare',
      min_height: 500,
      height: 500,
      margin: { top: 35, right: 5, bottom: 50, left: 72 },
      inner_border: 'rgb(210, 210, 210)',
      toolbar: [],
      axes: {
        // Most usages of this layout will override these labels
        x: {
          label: 'Trait 1',
          label_offset: 44,
        },
        y1: {
          label: 'Trait 2',
          label_offset: 38,
        },
      },
      data_layers: [
        {
          id: 'locuscompare',
          namespace: { trait1: 'trait1', trait2: 'trait2', ld: 'ld' },
          data_operations: [
            {
              type: 'fetch',
              from: ['trait1', 'trait2', 'ld(trait1)'],
            },
            {
              type: 'inner_match',
              name: 'scatter_points',
              requires: ['trait1', 'trait2'],
              params: ['trait1:variant', 'trait2:variant'],
            },
            {
              type: 'left_match',
              name: 'assoc_plus_ld',
              requires: ['scatter_points', 'ld'],
              params: ['trait1:variant', 'ld:variant2'],
            },
          ],
          type: 'scatter',
          tag: 'locuscompare',
          id_field: 'trait1:variant',
          coalesce: { active: false }, // The heuristics used don't make sense for QTL plots.
          point_shape: ['circle'],
          point_size: [40],
          color: [
            {
              scale_function: 'if',
              field: 'lz_is_ld_refvar',
              parameters: {
                field_value: true,
                then: '#9632b8',
              },
            },
            {
              scale_function: 'numerical_bin',
              field: 'ld:correlation',
              parameters: {
                breaks: [0, 0.2, 0.4, 0.6, 0.8],
                // Derived from Google "Turbo" colormap, breakpoints [0.05, 0.25, 0.45, 0.65, 0.85]
                values: ['rgb(70, 54, 153)', 'rgb(38, 188, 225)', 'rgb(110, 254, 104)', 'rgb(248, 195, 42)', 'rgb(219, 61, 17)'],
              },
            },
            '#AAAAAA',
          ],
          z_index: 2,
          x_axis: {
            field: 'trait2:t2_neg_log_pvalue',
            floor: 0,
            upper_buffer: 0.1,
          },
          y_axis: {
            axis: 1,
            field: 'trait1:t2_neg_log_pvalue',
            floor: 0,
            // floor: 0,
            upper_buffer: 0.10,
            // min_extent: [0, 10],
          },
          behaviors: {
            onmouseover: [
              { action: 'set', status: 'highlighted' },
            ],
            onmouseout: [
              { action: 'unset', status: 'highlighted' },
            ],
            onclick: [
              { action: 'toggle', status: 'selected', exclusive: true },
            ],
          },
          tooltip: {
            closable: true,
            show: { or: ['highlighted', 'selected'] },
            hide: { and: ['unhighlighted', 'unselected'] },
            html: '{{trait1:variant}}<br>GWAS: {{trait1:t2_neg_log_pvalue}}<br>eQTL: {{trait2:t2_neg_log_pvalue}}'
          }
        }
      ],
    }

  ],

});

LocusZoom.Layouts.add('panel', 'association_with_cond', (function () {
  let base = LocusZoom.Layouts.get('panel', 'association');
  base.axes.y2.label = 'Recomb (cM/Mb)';
  base = LocusZoom.Layouts.renameField(base, 'assoc:log_pvalue', 'assoc:t2_neg_log_pvalue', false);
  base = LocusZoom.Layouts.renameField(base, 'assoc:beta', 'assoc:t2_beta', false);
  base = LocusZoom.Layouts.renameField(base, 'assoc:se', 'assoc:t2_stderr_beta', false);

  // In this browser, we have very limited LD information. The default "make LD ref var" button is removed and instead we use a custom tooltip template.
  LocusZoom.Layouts.mutate_attrs(
    base,
    '$..data_layers[?(@.tag === "association")].tooltip.html',
    `<strong>{{assoc:variant|htmlescape}}</strong><br>
    P Value: <strong>{{assoc:t2_neg_log_pvalue|logtoscinotation|htmlescape}}</strong><br>
    Ref. Allele: <strong>{{assoc:ref_allele|htmlescape}}</strong><br>`
  );

  // Filter out records where -log10 p-value is null
  // This happens when conditional analysis eliminates a variant
  LocusZoom.Layouts.mutate_attrs(
    base,
    '$..data_layers[?(@.tag === "association")].data_operations',
    (ops) => {
      ops.push({
        type: 'filter_null',
        requires: ['assoc_plus_ld'],
        params: ['assoc:t2_neg_log_pvalue'],
      });
      return ops;
    }
  );
  return base;
})());

/**
 *
 * @param {Object} trait1  {id, label}
 * @param {Object} trait2 {id, label}
 * @param state
 * @return {*}
 */
function get_region_layout(trait1, trait2, state = {}) {
  // Generate LocusZoom stacked plots layout for classic region plot comparing two tracks
  // Customizations:
  //   1. Allow showing both conditional and marginal p values (toggle button; ask for more data)
  //   2. show two tracks
  //   3. (future) Some mechanism for highlighting which items are part of this particular signal cluster. We use shape for dir of effect and color for LD. Toggle menu? Size?
  const { id: t1_id } = trait1;
  const { id: t2_id } = trait2;

  const panels = [];

  return LocusZoom.Layouts.get('plot', 'standard_association', {
    panels,
    state,
    toolbar: {
      widgets: [
        // LocusZoom.Layouts.get('toolbar_widgets', 'ldlz2_pop_selector'),
        {
          type: 'download',
          position: 'right',
          group_position: 'end',
        },
        {
          type: 'download_png',
          position: 'right',
          group_position: 'start',
        },
      ]
    },
  });
}

function get_compare_layout(x_label, y_label, state = {}) {
  // Generate LocusCompare "a vs b" scatter plot

  const layout = LocusZoom.Layouts.get('plot', 'locuscompare', {
    state,
  });

  // We only need to slightly change nested properties for each of these, so...
  // FIXME: Yeah this nomenclature is maximally confusing
  LocusZoom.Layouts.mutate_attrs(layout, '$.panels[?(@.tag === "locuscompare")].axes.x.label', y_label);
  LocusZoom.Layouts.mutate_attrs(layout, '$.panels[?(@.tag === "locuscompare")].axes.y1.label', x_label);
  return layout;
}

function get_region_sources(genome_build, trait1_url, trait2_url, ld_url) {
  // Generate data source object that is used by both region and locuscompare plots
  const apiBase = URLS.PORTALDEV_API
  return [
    ['trait1', ['ColocRegionAdapter', { url: trait1_url }]],
    ['trait2', ['ColocRegionAdapter', { url: trait2_url }]],
    ['ld', ['ColocLDAdapter', { url: ld_url }]],
    ['gene', ['GeneLZ', { url: `${apiBase}annotation/genes/`, source: 2 }]],
    ['recomb', ['RecombLZ', { url: `${apiBase}annotation/recomb/results/`, build: genome_build }]],
    ['constraint', ['GeneConstraintLZ', { url: 'https://gnomad.broadinstitute.org/api/', build: genome_build }]]
  ];
}

function toggle_trait(layout, namespace, old_prefix, new_prefix) {
  // Marginal signals provide two kinds of signal / trait in one response, prefixed by t1: and t2:.
  //  This replaces all key fields for the LZ and compare plots. (the prefix must include namespace, like `assoc:t1_`.
  ['beta', 'stderr_beta', 'neg_log_pvalue'].forEach((name) => {
    const old_name = `${namespace}:${old_prefix}_${name}`;
    const new_name = `${namespace}:${new_prefix}_${name}`;

    // eslint-disable-next-line no-param-reassign
    layout = LocusZoom.Layouts.renameField(layout, old_name, new_name);
  });
  return layout;
}

export { config_to_sources, get_region_sources, get_region_layout, get_compare_layout, toggle_trait };
