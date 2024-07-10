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

// *** Computed ****************************************************************
const region = computed(() => {
  return { chr: props.chr, start: props.start, end: props.end }
})

// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
const emit = defineEmits(['RegionPanelRemoved', 'RegionPanelAdded'])

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
  plot.on('panel_removed', (eventData) => {
    // console.log('LZ Event received by LZPLot:', eventData)
    if(eventData.data === 'genes') return
    emit('RegionPanelRemoved', eventData)
  });
}

const callPlot = (callback) => {
  // Consume return values with caution to avoid leaking internals
  return callback(plot);
}

const callSources = (callback) => {
  // Consume return values with caution to avoid leaking internals
  return callback(_data_sources);
}

let panelCounter = 0

const addPanel = (signal) => {
  panelCounter += 1
  const signalID = signal.uuid
  const panelLabel = `assoc_${panelCounter}_${signalID}`
  const dataSourceURL = url`/api/v1/signals/${signalID}/region/`
  const [variantLabel, variantColor] = makePlotTitle(signal)
  const ldSource = `ld_${panelCounter}_${signalID}`
  const ldURL = url`/api/v1/ld/${signal.analysis.ld}/region/`

  const panel = LocusZoom.Layouts.get('panel', 'association_with_cond', {
    id: panelLabel,
    height: 200,
    title: { text: variantLabel, style: { fill: variantColor, 'font-size': '1.0rem', 'font-weight': 'normal' } },
    y_index: -1,
    namespace: {
      assoc: panelLabel,
      ld: ldSource
    }
  });

  emit('RegionPanelAdded', { signalID: signal.uuid, panelID: panelLabel, variantID: signal.lead_variant.vid })

  callSources((ds) => {
    ds.add(panelLabel, ['ColocRegionAdapter', { url: dataSourceURL }])
  })

  callSources((ds) => {
    ds.add(ldSource, ['ColocLDAdapter', { url: ldURL }]);
  })

  callPlot((plot) => {
    plot.addPanel(panel)
  })
}

defineExpose({
  addPanel,
  callPlot
})
// *** Configuration data ******************************************************
</script>

<style scoped>
</style>
