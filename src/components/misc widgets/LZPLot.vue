<template>
  <div>
    <div :id="dom_id" class="lz-container-responsive">
      <slot />
    </div>
  </div>
</template>

<script setup>
// *** Imports *****************************************************************
import { computed, defineEmits, onMounted, onBeforeUnmount, watch } from 'vue'
import LocusZoom from 'locuszoom'
import 'locuszoom/dist/locuszoom.css'
import { config_to_sources } from '@/util/lz-layouts';
import { makePlotTitle, url } from '@/util/util';
import { useFilterStore } from '@/stores/FilterStore'

// *** Composables *************************************************************
const filterStore = useFilterStore()

// *** Props *******************************************************************
const props = defineProps({
  base_layout: { type: Object, default: () => ({}) },

  // Data sources can be specified as either config, OR an explicit data sources object.
  //  (the latter scenario is useful if one page has multiple LZ plots shown side by side sharing the same cache)
  base_sources: { type: Array, default: () => [] },
  explicit_sources: { type: Function, default: () => null }, // To avoid wrapping as observable, pass this as a getter function instead of the raw LocusZoom.DataSources (super weird but it's an internal and advanced usage)
  // Plot region
  chr: { type: String, default: '' },
  start: { type: Number, default: 0 },
  end: { type: Number, default: 0 },
  show_loading: { type: Boolean, default: false }, // Show loading indicators
})

// *** Variables ***************************************************************
filterStore.plotID += 1 // Ensure that every component instance has a unique DOM id, for use by d3
const dom_id = `lz-plot-${filterStore.plotID}`; // DOM element
const plot_id = dom_id.replace(/-/g, '_'); // How to expose the plot instance globally
// This is important: plot must be assigned as a static property. If it were a field in
//  `data` , vue would recursively wrap it as an observable, and Really Bad Things Happen.
let plot = null;
let _data_sources = null;

let signals_added = [] // 1 signal per plot pair for now

// *** Computed ****************************************************************
const region = computed(() => {
  // return allColumns.filter(header => header.visible())
  return { chr: props.chr, start: props.start, end: props.end }
})

// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
const emit = defineEmits(['any_lz_event'])

// *** Watches *****************************************************************
watch(() => region,() => {
  const region = { ...this.region };
  const diffs = Object.keys(region).reduce((acc, key) => {
    const new_val = region[key];
    if (new_val !== this.plot.state[key]) {
      acc[key] = new_val;
    }
    return acc;
  }, {});
  if (Object.keys(diffs).length) {
    // Only re-render if the passed-in state values would be different
    this.plot.applyState(diffs);
  }
}, {deep: true,}
)

// *** Lifecycle hooks *********************************************************
onMounted(() => {
  // console.log('lz plot on mounted')
  // console.log('region etc:', props.chr, props.start, props.end, props.show_loading)
  // console.log('base_layout:', props.base_layout, 'base sources:', props.base_sources)
  createLZ(props.base_layout, props.base_sources);
})

onBeforeUnmount(() => {
  // console.log('destroying plot')
  try {
    this.plot.destroy();
    delete this.plot;
    delete window[plot_id];
  } catch (e) {
    // console.warn('could not destroy plot, already destroyed') // happens because Vue already killed it via render(null, ref)
  }
})

// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
const createLZ = (base_layout, base_sources) => {
  // console.log('createLZ')
  // Create and populate the plot
  // The layout comes from properties assigned to a vue instance, which are automatically
  //   wrapped (deeply) with Vue observable getters/setters. This can confuse LocusZoom,
  //   so we will deep-copy to ensure this is just pure JS primitives
  const layout = JSON.parse(JSON.stringify(base_layout));
  // console.log('lz: layout:', layout)

  let data_sources;
  let explicit_sources = props.explicit_sources // { explicit_sources } = this;
  explicit_sources = explicit_sources(); // unwrap getter to value
  if (props.base_sources.length && explicit_sources !== null) {
    throw new Error('base_sources (config) and data_sources (object) are mutually exclusive');
  }

  if (explicit_sources) {
    // Use explicitly passed sources if provided
    data_sources = explicit_sources;
  } else {
    // Use config options to create data sources
    data_sources = config_to_sources(base_sources);
  }

  const plotx = LocusZoom.populate(`#${dom_id}`, data_sources, layout);
  if (props.show_loading) {
    // Add loading indicator to every panel if appropriate
    plotx.layout.panels.forEach((panel) => plotx.panels[panel.id].addBasicLoader());
  }
  // Save references to the plot for manipulation later
  plot = plotx;
  _data_sources = data_sources;
  window[plot_id] = plotx;
  // Expose events to things outside this component
  // IMPORTANT: never consume this value in a way that would wrap it as an observable
  //   (eg by assigning it to a field in `data`).
  connectListeners(plotx);
}

const connectListeners = (plot) => {
  plot.on('any_lz_event', (eventData) => emit('any_lz_event', eventData));
}

const callPlot = (callback) => {
  // Consume return values with caution to avoid leaking internals
  return callback(plot);
}

const callSources = (callback) => {
  // Consume return values with caution to avoid leaking internals
  return callback(_data_sources);
}

const clearSignalList = () => {
  signals_added.length = 0;
}

const addPanelPair = (signal1, signal2) => {
  // console.log('lzplot adding panels to:', this.signals_added.length);
  const s1id = signal1.uuid;
  const s2id = signal2.uuid;
  const s1s2_key = `${s1id}__${s2id}`;

  if (signals_added.includes(s1s2_key)) return; // don't add the same signal (pair) more than once

  signals_added.push(s1s2_key);

  const dsu1 = url`/api/v1/signals/${s1id}/region/`;
  const dsu2 = url`/api/v1/signals/${s2id}/region/`;

  const panel1_label = `signal_panel${signals_added.length * 2 - 1}`;
  const panel2_label = `signal_panel${signals_added.length * 2}`;

  const [signal1_label, s1_color] = makePlotTitle(signal1);
  const [signal2_label, s2_color] = makePlotTitle(signal2);

  const ld1_source = `ld${signals_added.length * 2 - 1}`;
  const ld2_source = `ld${signals_added.length * 2}`;

  const panel1 = LocusZoom.Layouts.get('panel', 'association_with_cond', {
    id: `${panel1_label}-${signal1.uuid}`,
    height: 200,
    title: { text: signal1_label, style: { fill: s1_color, 'font-size': '1.0rem', 'font-weight': 'normal' } },
    y_index: -1,
    namespace: {
      assoc: panel1_label,
      ld: ld1_source
    }
  });

  const panel2 = LocusZoom.Layouts.get('panel', 'association_with_cond', {
    id: `${panel2_label}-${signal2.uuid}`,
    height: 200,
    title: { text: signal2_label, style: { fill: s2_color, 'font-size': '1.0rem', 'font-weight': 'normal' } },
    y_index: -1,
    namespace: {
      assoc: panel2_label,
      ld: ld2_source
    }
  });

  const ld1_url = url`/api/v1/ld/${signal1.analysis.ld}/region/`;
  const ld2_url = url`/api/v1/ld/${signal2.analysis.ld}/region/`;

  callSources((ds) => {
    ds.add(panel1_label, ['ColocRegionAdapter', { url: dsu1 }]);
    ds.add(panel2_label, ['ColocRegionAdapter', { url: dsu2 }]);
  });

  callSources((ds) => {
    ds.add(ld1_source, ['ColocLDAdapter', { url: ld1_url }]);
    ds.add(ld2_source, ['ColocLDAdapter', { url: ld2_url }]);
  });

  callPlot((plot) => {
    plot.addPanel(panel1);
    plot.addPanel(panel2);
  });
}

defineExpose({
  addPanelPair,
  callPlot
})
// *** Configuration data ******************************************************

</script>

<style scoped>
</style>
