# Colocus V 2.0

This is a Vue 3 app built using Vuetify 3. It is loosely based on the Vue 2/Vuetify 2 app.

## Page structure
Overall page structure is defined in App.vue, which simply loads the toolbar, provides a <v-main> section, where router views are displayed, followed by the footer. The <v-main> section is a Vuetify <v-row>. Each page of the application pages is defined in a separate file in the src/views folder. Each view file will typically wrap their content in Vuetify <v-col> elements. 

## Major components

### FilterPanel
The <FilterPanel> component is a composite that is defined by a set of nested files in its own folder under src/components. It consists of several subpanels, each of which contains a set of controls. Key elements of the <FilterPanel> component include the following:
- a template section that defines the component hierarchy.
- a data structure, controlConfig, that contains configuration data for all of the controls
- regex patterns used for input validation
- rule functions used for input validation

Standard Vue props pass key data elements down to the subpanels and individual controls.

Each subpanel has an optional reset button, which will reset its contained controls back to a default state, which is passed to the controls via the controlSet prop, as specified in the top level <FilterPanel>. The subpanels and controls utilize Vue 3's provide/inject mechanism to dynamically pass messages. For example, when the user clicks the Reset button, it flips the value of a local ref variable, resetInput, and that variable is used by the provide mechanism. 

Then, in the underlying controls, Vue's inject mechanism allows monitoring of that variable's state. When the state changes, the control reloads itself, and updates the Pinia store with the default value. For example, all the child components of a given filter sub panel respond to the same reset signal.

All of the underlying controls are composites, consisting of a text label, whose value is passed in as a prop (controlSet.title), plus a wrapper around a standard Vuetify control (AutoComplete, TextField, Switch).

The <CtlAutocomplete> component also listens for changes to a second injected signal, loadFPControls. This is provided by the top level pages (Search and LocusZoom), and is toggled in their onMounted events, when it is safe to assume that the search metadata API call has returned and stored its results in the Pinia store. So when a <CtlAutocomplete> sees that flag toggled, it loads the select list with the appropriate data from Pinia. The <CtlAutoComplete> control also loads its own (user) data in the onMounted event. This is needed when transitioning between the Search and LocusZoom pages, and other pages. The function populateControlData handles this, including a mapping from the current page name, so that it knows which data element in the Pinia store to access. Last, a modelChanged function updates the store upon user input.

The <CtlSwitch> component is similar, but simpler. It also listens for a reset signal, and responds to user input by updating the Pinia store.

The <CtlTextfield> component is similar. It also listens for a reset signal, and responds to user input by updating the Pinia store. It also debounces user input, to avoid needlessly triggering API calls upon incomplete input. It also applies the passed-in rule to the user input. On invalid input, a message, which is actually part of the rule definition in <FilterPanel> is displayed in red by the control. The only other thing of note is a function, trapEmpty, that checks whether the control has a value when it loses focus, and if not, provides an 'empty' value, passed in from the data structure in the parent <FilterPanel>.

### Search metadata loading
There is a Vue 3 composable, featchData.js, that handles data loading. Getting it working with the filter controls was tricky, so worthy of some explanation. Initially I tried loading the search metadata in the App.vue file, but it actually appers to load its elements in an async manner. So, for example, you can't assume that the Pinia store is ready when loading a page such as Search. Normally it would be, as you would access it after loading the Home page. But if you force-reload on the Search page, the page will display before the store is ready. This would also occur if a user bookmarked the search page (even though at present their filter settings would not be restored on direct access to the page).

The most reliable way I found to load the search metadata was to use the route guard, beforeEach, which loads the filter data if it hasn't already been loaded.

### Data table
The <DataTable> component, along with all child components, is defined in a subdirectory of /src/components. In order to reduce the complexity of the main file, some routines and configuration data have been moved to a composable, DataTableHelpers, in /src/composables.

### Data loading

The way it currently works:

Search page loads. It has provide flags for:
- loadFPControls
- preLoadGenes
- loadDataTableFlag
  In onMounted, loadFPControls is flipped to load the filter control lists. Then either preLoadGenes or loadDataTableFlag is flipped, depending on whether there is a gene specified in the url.

The Manhattan page has the same flags.

The DataTable component injects the loadDataTableFlag and watches it. Whenever it changes, the watcher executes loadTableData.

Whenever filter data changes, the associated control calls appStore.updateFilter. It then flips filterDataChanged. The DataTable watches that, and executes loadTableData whenever it flips.

Whenever the user changes page or page size, appStore.updateFilter is again called, which flips flag filterDataChanged. There is logic as to when it will do so. Mainly, we want to ignore a page num event immediately after a page size event. Otherwise, the flag if flipped twice in succession, and the watch in the DataTable misses the change, so data is not loaded.

### Pinia store

Currently, there is one Pinia store, and it holds all app state. At the top level, this includes a set of general keys, plus a set of keys for the main views (search, locuszoom, manhattan (probably, assuming it needs filter)). A function provides the data structure to ensure consistency across pages and to avoid repitition. There are also two objects that function as maps between 1) data key names in the app vs those expected by the API, and 2) sort keys expected by the back end.

This store started off supporting data structures required by the filtering system, but has grown, and may be renamed or split into separate stores as development proceeds.

The data structure includes global state variables (e.g., isDataLoaded), plus page-specific data for each page that uses a filter panel. The page-specific data includes the values of the controls, plus additional entries for page size and page number, all of which are brought together, along with the sort keys, to build the URL for the Django back end.

#### Important action methods
- buildSearchURL builds a URL based on all filter and sort criteria and formats it for consumption by the Django REST API back end.
- checkGenes accepts a comma-delimited list of genes and returns an object containt two arrays, badGenes, and goodGenes. This is used in the case where an external entity (such as AMP) specifies a gene as a query string in a URL directed at the search page.
- copySearchFilterToLZ copies the filter panel data for the search page into the corresponding keys for the LocusZoom page, and is called by the router before entering the LocusZoom page.
- loadFilterData relies on the async composable, fetchData.js to load the filter data lists and populates the filterPanelControls keys for use by the FilterPanel controls.
- updateFilter is a helper for the filter panel components. updateFilter updates the appropriate value in the appropriate key, depending on which page (Search or LocusZoom) the user is on.
- updateSort updates the store key storing sort parameters that end up in the URL.
- updateSwitch updates the booleans tracking the display of the ensemble IDs and the concordance values.
- toggleFilterPanel is used by the <Toolbar> to show and hide the filter panel.

### Router
For most pages, the router simply provides a link to the corresponding view file. The Search and LocusZoom pages enable the filter panel and button, and the LocusZoom page copies user filter panel selections and entries from the Search page data.

There is a global route guard, beforeEach, which disables the filter panel and loads filter data if needed.

## Styling
A key design goal of this iteration of Colocus was to centralize style definitions as much as possible. Vuetify has an extensive color management system, based on Google's Material Design, but it only covers Vuetify components, not native HTML elements, such as headings, spans, etc. The solution is to define a custom theme in the Vuetify loader, and then have a global css file that references variables from it. (The global css file is imported in main.js.)

A custom theme may be viewed as an overlay on the built-in theme, where it is possible to override built-in values and add new color keys. Initially, we have chosen the latter approach, defining several color values in plugins/vuetify.js (where the clc prefix stands for Colocus color):

```vue
    themes: {
      myCustomTheme: {
        dark: false,
        colors: {
          something: '#00ff00' ,
          clcBackground: '#fafafa',   // css: aliceblue: '#f0f8ff'
          clcAction: '#F57C00',       // md: orange-darken-2: '#F57C00'
          clcHeading: '#1E88E5',      // md: blue-darken-1: '#1E88E5'
        },
      },
    },
```

Then in styles/global.css:

```css
h1 {
  font-size: 2rem;
  color: rgba(var(--v-theme-clcHeading), 1.0);
}

h2 {
  font-size: 1.5rem;
  color: rgba(var(--v-theme-clcHeading), 1.0);
}

h3 {
  font-size: 1rem;
  color: rgba(var(--v-theme-clcHeading), 1.0);
}
```
The details will likely change, but this illustrates the principle. The rgba(var(--v-theme-<custom-color>), a.b) expression specifies the color name defined in the Vuetify file, with an optional opacity value of a.b, which may range from 0.0 to 1.0, so tints would be possible.

The file src/ide-helper.css functions to prevent spurious warnings from the WebStorm IDE about these var expressions. The file is not imported or otherwise used anywhere in the project. Each custom color added to the custom theme in vuetify.js should have a corresponding entry here. The value shouldn't matter, as, again, the file is not used by the app. Without this file, the IDE presents a distracting warning wherever a  var expression with a --v-theme-<custom-color> is used.

## Component import
It is unnecessary to explicitly import components in this app. Importing is handled by a plug-in called unplugin-vue-components. This plugin automatically imports .vue files created in the src/components directory, and registers them as global components. Then, when the template is rendered, the appropriate import statement is injected.

This means that you can use any component in the application without having to manually import it. You can add additional folders in the plugins.Components.dirs array in vite.config.mjs. The advantage is that it simplifies refactoring the src/components directory. The WebStorm IDE currently does not understand this, so it highlights non-imported component references as if they were errors. Note: If you move files around while the app is running, you'll have to restart the node server.

## Specific views

### Search view
The Search View provides a context for displaying a data table. It uses the Vue 'provide' mechanism for three variables.
- loadFPControls: a Boolean that when toggled tells the underlying controls on the filter panels to load their select lists (from the Pinia store)
- loadTableDataFlag: a Boolean that when toggled tells the data table to load data.
- preloadGenes: an array variable that when set tells the underlying Genes control to adopt the provided values as if they had been selected by the user. (The values actually come in through a URL.) Setting this value also triggers a data load of the main data table. The sequence here is:
  - Extract gene string from URL query string
  - If there are valid genes, update preLoadGenes
  - Through provide/inject this causes the underlying AutoComplete to call the updateFilter method on the Pinia store
  - UpdateFilter adds the selected gene(s) to the filter data, then toggles local variable filterDataChange
  - The DataTable component watches the variable and triggers a data load when it changes.
The reason the DataTable has to watch appStore.filterDataChanged, instead of using provide/inject, is that it is not possible to use that mechanism from within a Pinia store. The effect is the same, it's just a different way of triggering a desired event.

### Trait following
This is a feature added and then disabled. It was originally added due to hope for the Manhattan view to display data in the data table from multiple studies, and allow the user to filter by phenotype. But then it turned out that the back end as presently configured, could not support this. I am disabling the code, but documenting here, in case we decide to go back and correctly implement that feature.

On the Search page, the user clicks a trait link. The router pulls trait from the URL and saves it in the appStore as a top-level property called preloadTrait. The Manhattan view copies that to a local variable in its onMounted lifecycle method. It `provides` that value for injection where needed, in this case the AutoComplete control. It `watch`es that variable, and when it is updated, assigns it to local variable selectedItems, thus populating the on-screen control, and then calls updateFilter on the filter store with that value, which causes the data table to load.

The Search page also has references to preloadTrait, which are not used, but are required so that the AutoComplete controls will function.

To re-enable the feature, search across files for preloadTrait and remove the comment markers. Also have to add the trait name to the router-link passed by the data table. And add :trait to the path in the route to the Manhattan page in the router.

### Manhattan plot view

### Help view
The help page exists in source code as a markdown file, help.md. It is rendered into HTML by the marked library. The rendering is controlled by Vite, in the vite.config.mjs file. In it is a function, markdownPlugin, which is registered as a plugin in defineConfig. The function is called whenever the underlying markdown file is changed, or when Vite builds for production.

The file HelpView.vue defines two columns, the left for a table contents, the right for the actual content. Clicking a link in the TOC causes the right side to scroll to the associated position in the document.

Note that although the markdown file is referenced, it is the HTML file that is actually rendered.

The TOC must be maintained manually. Its href values are determined by the render function in the vite config file.

A Vue watch is set up to watch the v-sheet that contains the help content. When it is populated, the watcher sets up the event listeners for the links, and when it is being torn down, the event listeners are removed. This is necessary to prevent memory leaks, and to avoid navigation problems with the Vue router.

### Locuszoom view
This is the most complicated page of the app thus far. It consists of five main files, plus references to the appStore, utils, etc. The main files are:
- LocusZoomView.vue: This is the top-level page definition linked to by the router. It primarily consists of the Vue template definition, plus event handlers. 
- lzPageHelpers.js: This is a composable that contains the meat of the functionality required by the page.
- LzPlot.vue: This is a wrapper, lightly mofified from the Vue 2 app, that allows creation of the main containers for the compare and region plots.
- lz-layouts.js: This is a configuration file, more heavily modifed from the Vue 2 app, to provide more flexitilty in creation containers and plots.
- LDPanel.vue: This ia Vue single-file component, the provides the UI controls for operating the page. 

#### Data loading
Our common idiom for data loading in this app is to set a flag from the source requesting the data, then watch that flag and load data when it changes. That pattern is used in the LZ page as well. The onMounted lifecycle hook initiates data loading.

First we set the appStore.locuszoom.tableDataLoaded to false. Later, when the data table's loadData is called, this alerts it that the data is needed.

Then we flip the value of local variable, loadFPControls. This is provided to controls in the filter panel to alert them to load their static data, such as the gene list, not user selections.

Next we set the flag appStore.colocDataReady to false. The data table's loadData function sets that flag to true when the coloc data is ready. Then we have several watchers that take appropriate action when the colocalization data is ready:
- the LDPanel component, which allows to set the correct radio button for the initial LD reference
- the LocusZoom page, and this is what kicks off loading of the compare and region plots.

This version of the code programmatically creates the compare container and plot, plus the region container and plots, including the gene panel. To accomplish this, we removed the static configuration data from the definitions in lz-layouts. Most of it was discarded, but we needed to use two static defintions (gene_selector_menu, and genes_layer_filtered), which we embedded in the LZPLot.vue file. We replaced the static definitions of the region plot and the gene panel with a programmatic approach. See the functions addRegionPanel() and addGenePanel in LZPLot for details.

We also refactored almost everything except the template definitions and event handlers out of the main page view (LocusZoomView.vue), and into the composable lzPageHelpers.js.
 
#### LZ Plots
Placeholders for the compare plot and the region plot are defined in the template as empty divs:
```
...
<div ref="comparePlot"></div>
...
<div ref="regionPlot" class="region-plot"></div>
...
```
Then the `ref` variables are populated by functions buildCompareLayout and buildRegionLayout in the composable. Internally, each uses an advanced Vue feature called VNodes. Vnodes are virtual nodes that Vue uses to track the entire structure of an application. At the highest level, declarative templates are compiled to Vnodes and then assembled into a virtual DOM. Vue tracks changes to the virtual DOM and periodically transfers changes to the actual DOM. Our build*Layout functions create Vnodes based on the underlying LZPlot library. The *VnodeRef variables maintain Vue references to these components so that we can do things with them later, such as adding additional plots.

A key function in the composable, **assembleLayout()**, builds the overall containers (compare and region), then adds the initial plots to the region panel.

**buildRegionLayout()**, which, replaces the old static configuration, builds the container that will hold the region plots, saves a ref to the Vnode, and populates the regionPlotRef, which is passed in from the LZ page, and is thus displayed by Vue's reactivity system.

Similarly, **buildCompareLayout()**, builds the container, and also creates the scatter plot directly.

#### The LD panel
The LDPanel is component that displays operational controls for the LZ page, including a list of variants to be used as LD references in the region plots. The list is generated in the composable and then pushed to the appStore. Earlier, I tried supply the list directly to the LDPanel, but it would not display correctly. In different scenarios, it would display only the first two elements, or duplicate the first two elements as panels were added, or display nothing in the label slot. The functional workaround was to push the list to the appStore.

So LDPanel  pulls the list from there for display as radio buttons. Using our VariantLabel component caused erroneous behavior. The solution was to render and format the values directly. The downside to this is that it is partially redundant with code in the VariantLabel component. My hunch is that Vue's reactivity system was failing with all the nesting. Perhaps a new version of Vue, Vuetify, or both will help. As of this writing (2024-07-22), we are using the following key libraries, which are the latest as of this date:

```
    "pinia": "^2.1.7",
    "vue": "^3.4.33",
    "vue-router": "^4.4.0",
    "vuetify": "^3.6.13"
```

## Misc debugging hints
- use {{ $log() }} in templates to log local values to console. This is defined in main.js.

## Genes for testing
A2M,AAMP,PDF
A2M,AAMP,PDF,
A2M,AAMP,PDF,x
A2M,AAMP,\t\r\n\n   PDF,y
A2M,A2ML1-AS1,AAGAB,AAK1,AAMP,ABCA1,ABCA8,ABCG5,ABCG8,ABHD12,ABLIM3,ABTB1,ENSG00000000938,x,y
A2M	A2ML1-AS1	AAGAB	AAK1	AAMP	ABCA1	ABCA8	ABCG5	ABCG8	ABHD12	ABLIM3	ABTB1	ENSG00000000938	x	y

z
vv
x1

## Section headings in view and component files
I find that it helps reduce cognitive load to have the sections in the same order throughout the application. There are some dependencies among them; for example, variables must be defined before watches. Very simple components don't need the overhead. This structure does not fit composables, constants, and helper files. In those cases, we list functions alphabetically. 

```
// *** Imports *****************************************************************
// *** Composables *************************************************************
// *** Props *******************************************************************
// *** Variables ***************************************************************
// *** Computed ****************************************************************
// *** Provides ****************************************************************
// *** Injects *****************************************************************
// *** Emits *******************************************************************
// *** Watches *****************************************************************
// *** Lifecycle hooks *********************************************************
// *** Event handlers **********************************************************
// *** Utility functions *******************************************************
// *** Configuration data ******************************************************
```

## Naming conventions
- Name event handlers with preceding 'on', eg onRowClick
- Prefix booleans with is, eg: isLoading
- Put destructured imports in alphabetical order, eg import { onMounted, provide, ref, watch } from 'vue'
- Imports should be in this order: Vue, third-party libraries, app-level imports
- List variables, props, watches, computeds, etc., within a section, in alphabetical order

## Cypress test framework
In the fall of 2024, we implemented the front-end testing framework, Cypress, learned a bit about it, and implemented some basic tests. The result exists in branch front-end-testing-with-cypress. It was built on Cypress 13.16.0. It includes a single file (test1.cy.js) with our tests, plus two folders of sample tests supplied by the vendor for reference.

### Running tests
To run cypress, open an additional terminal window in the project directory. The node process running the front end as well as the Django process both need to be running. Then run cypress:
```
$ npm run cypress:open
```
This executes a script defined in package.json. It will open a window, which is the cypress app. It presents two buttons, E2E Testing and Component Testing. We did not implement any component tests, so click E2E to get started. Next a browser selection window opens, and will show browsers installed on your system. We only testing using Chrome. Select Chrome if not already selected, then click the green button, Start E2E Testing in Chrome.

A new special Chrome instance will open full screen. Resize as desired, then scroll down to the bottom of the list to find test1.cy.js and click it. It will run all tests in the file and all should pass. (Actually with code as committed, will only run the study selector test. Remove the `.only` tag on it to run all tests.)

### About the tests
As this was a proof-of-concept, there are several unrelated tests in the file. Each group of tests is contained in a `describe` block. Each block is defined by a text string that is output when tests are run, and further serve as documentation, plus a callback function that contains several tests. Each test is defined by an `it` block, again with a text string and a callback containing a single test.

The first `describe` group validates basic navigation to the currently active pages of the app. The second tests some functionality of the search page - mainly, the filter panel.

Cypress supports the concept of hooks. In our case, both `describe` blocks use a `beforeEach` hook, which is run before each test. For the navigation block, the `beforeEach` simply loads the home page via the `visit` command, and for the search page, it loads the search page.

Note the test, "test the study selector". It is defined by `it.only`, which means only that test will run when the file is executed. The first line of the test enters (types) the desired study and forces it to be selected.
```
    cy.get('#studyInput').type('AdipoExpress{enter}{esc}{esc}')
```
The remaining lines then execute different versions of the same test, which insures that the first row, third column of the data table contains the string 'Adi...xpress'. The first two of those are commented out, as they are undesirable from the standpoint of the selector used to find the component of interest in the DOM.

The first commented out test drills all the way from the vue `#app` component.

The second drills from the component `#dataTableSearch` (which is actually a div containing the actual HTML table). One element in the select chain is `[data-v-dd96f50a=""]` which is an attribute on a span created by Vuetify. I was concerned that the `dd96f50a ` might change between installations or versions of Vuetify, so looked for a more generic approach.

The third also drills from `#dataTableSearch`, but then uses the Cypress `within` command to penetrate to the lowest level span containing the desired text string. `Within` takes a callback function; within that we perform another `get` command to drill through the nested spans and get our test string.

There are actually sub-versions of that; one contains the literal string, the other a regex. I was concerned that we might change the parameters of the shortening function that removes the middle of long strings, so the regex version is a little more general-purpose, but still probably not ideal.

You might wonder if simply replacing `[data-v-dd96f50a=""]` with `span` in the second test would suffice, and for unknown reasons it in fact does not work, hence the third version using `within`.

### Test organization
Since this was a proof of concept and we just wanted to get something working, we made no attempt to organize the tests. For example, the first block, navigation, would become a separate file. The second block is really testing the filter panel, not the search page, so it's description would be altered, and it would move to its own file.

## To add new page to app
The example below adds a placeholder page, QC, to the app.
1. Add page name to PAGE_NAMES in ./constants
```
  QC: 'qc',
```
2. Add vue file to ./src/views
```
<template>
  <h1>Bonjour, le monde</h1>
</template>
```
3. Add entries to ./router/index.js
```
...
const qcPage = PAGE_NAMES.QC
...
  {
    path: `/${qcPage}`,
    name: qcPage,
    component: () => import('@/views/QC.vue'),
    beforeEnter: (to, from, next) => {
      next()
    }
  },
```
4. Optionally, add link to ./src/components/misc widgets/Toolbar.vue if not otherwise linked.
```
  <router-link to="qc" class="nav-link text-clcHeading">QC</router-link>
```

## Vega plots
Note: **This whole section is subject to rapid change as development continues.**

The plotting system depends on the following components
- The overall page (QC.vue)
- A vega spec for each plot, stored in src/vegaSpecs
- A Pinia store, QCStore, for plot data and operation
- A plot component, <VegaPlotContainer>, one for each plot rendered on the page
- VegaPlotConfig, a js file containing macro info for instantiating plots
- qcMake*, a set of composables providing data processing functions for building the data sets required by the plots. Some of the simpler data sets are generated within the QCStore.

### QC page
This view contains the overall page structure, including the templates for all the plots (so far just the one). The first two rows:
- page header and description
- <QCPanel> component, with controls to set h4 and r2, and to select study. This will move to a sidebar like the filter panel later on.

These are then followed by the plots, each an instance of <VegaPlotContainer>. That component accepts two props:
- a controlSet, following conventions established elsewhere in the app, which has some macro settings for each plot
- a vega spec, the details of each plot, including the data
In our app, the vega spec is a JS object, not a JSON blob, which simplifies dynamically updating things like the data set for the plot, and other settings.

The page's only action, in the onMounted hook, is to tell the qcStore to load the plot data from the back end, then flip the flag that triggers plot generation.

### qcStore
The Pinia store for this portion of Colocus is responsible for fetching data from the API, and generating data subsets for the different plots. It has state variables for those data elements, plus variables for the UI elements controlling the plot displays (h4, r2, and omics study). It has three primary actions:
- loadQCData: fetches fundamental data sets from the backend and generates subsets for the plots
- makeRecordsForAllPlots: regenerates plot data when needed (on initial load and when UI changes)
- updateQCStoreKey: updates state variables when UI controls change due to user interaction

There are also several internal functions (getColocDataForStudy, getQTLStudies) used for data processing.

### VegaPlotContainer
This component provides the template and run-time code to instantiate plots. The component is triggered by watching a flag in the qcStore (regenPlotFlag), and when that flag changes, building a new plot instance and embedding it in the containing div in the template. The flag is triggered on initial load of the QC page view, and on subsequent changes to the UI controls.

### Performance problems
Early development of this functionality went smoothly, but at a certain point, the time to render plots became excessive. Initially it was nearly instantaneous, but then grew to as much as 30 seconds in some scenarios. Eventually it was determined that the slowdown only occurs in dev mode. Running in production mode, plot generation and regeneration is instantaneous.

Rather than having to deploy to external platform, a server that can run locally was generated. It uses the Express js server. It requires the project to be built, then runs from the /dist folder. Details are in comments in /express-server.js. This file is part of the project, but its dependencies are dev only, so will not be part of a production bundle.

It is possible to run `vite build --watch` and have the dist folder updated in real time as files are saved. I added two npm scripts to experiment with this (both need to be running in separate terminal windows):
- dev-build: this runs vite build in watch mode, regenerating site after each save
- dev-serve: runs the express server as a standalone instance following a `npm run build`

It works, but is slow; takes 3.5 seconds to rebuild. Plus, Vue Dev Tools don't work in production mode. But better than waiting 30 seconds. Starting to wonder if switching from Vega-lite to Vega might improve things...

I attempted to optimize plot generation. Vega allows plots to be updated by supplying new data. The hope was that it would speed up redraws. However, it did not speed up the process, and furthermore left artifacts on the plot. I was unable to resolve either issue, so reverted to just regenerating the plot from scratch on each update of the UI controls. For potential future use, here is the code from VegaPlotContainer to generate a plot on initial use, then update it subsequently.
```aiignore
import embed from 'vega-embed'
import * as vega from 'vega'
// ...
const chartView = ref(null)
// ...
watch(() => qcStore.regenPlotFlag, async (newVal, oldVal) => {
  if(!chartView.value) { // initial hit, create plot
    qcStore.makeColocClassPlotRecords()
    vegaSpec.data.name = controlSet.dataName
    vegaSpec.data.values = qcStore.recordsColocClass
    const containerID = `#${controlSet.containerID}`
    const { view } = await embed(containerID, vegaSpec)
    chartView.value = view

  } else { // just update
    timeLog('starting to make plot records')
    qcStore.makeColocClassPlotRecords()
    timeLog('made plot records, starting vega update')
    chartView.value
      .change(
        controlSet.dataName,
        vega
          .changeset()
          .remove(() => true)
          .insert(qcStore.recordsColocClass)
      ).run()
    chartView.value.resize().run()
    timeLog('vega update complete')
  }
})

// this also necessitates providing a name for the dataset in the vega spec:
  "data": {
    "name": "placeholder",
    "values": []
  },

// and in the VegaPlotConfig for each plot
...
    dataName: "colocClassData",
...
```

Another performance issue: The UI became nonresponsive for long periods of time -- up to 15 mintues -- when plot data was stored as reactive data in the QCStore, so data must be stored nonreactively. 

### Plot dimensions
The plot specs in the Observable file use a method of setting global defaults for overall plot height and width. 
```aiignore
  "config": {
    "view": {
      "continuousHeight": 600,
      "continuousWidth": 600
    }
  }
```

Consequently, early graphs with smaller specified sizes adopted the sizes specified by later graphs. For example, Class of Colocalizations had a specified width of 600 but were actually about 800 wide.

So the config.view.continuous* were removed to set dimensions directly. In particular, setting only the width, and allowing Vega to set height itself produced better looking plots. Also, I removed the hard-coded value for width, and specified "container", thus allowing height to be specified externally by the Vue infrastructure.

Another issue is that Vega emits a warning, "VegaPlotContainer.vue:40 WARN Dropping "fit-y" because spec has discrete height." Attempts to resolve this were unsuccessful, primarily through setting the autosize property in the spec, as follows.

```aiignore
// "autosize": {
//   "type": "fit"
// },
// "autosize": {
//   "type": "fit-x",
//   "contains": "padding",
// },
```

### Plot fonts
Following a team discussion about font sizing in plots and the app generally, I experimented and found the following three settings in the spec file to set font sizes.
- layer.encoding.y.axis.fontSize: affects the y-axis labels
- layer.encoding.legend.labelFontSize: affects the legend labels
- layer.mark.fontSize: affects the in-bar text in the plots

### Adding new plot
- if needed, add data set to qcStore, make sure nonreactive
- add record to VegaPlotConfig.js, setting values appropriately
- create spec and add import to QC.vue
- add row for new plot, setting controSet and vegaSpec in the <VegaPlotContinaer> tag

#### Spec updates
- export const <spec-name>Spec = {...}
- remove config.view.* if present
- add following
"data": { "name": "placeholder", "values": [] },
"height": { "step": 22, }, // for bar charts only, else
"height": "container",
"width": "container",
- encoding.y.axis.labelFontSize: 14
- encoding.color.legend.labelFontSize: 12
- mark.fontSize: 14

### Mapping variables from ObservableHQ to our app
```aiignore
Observable name         Colocus name        plot    Description
----------------------- ------------------- ------- ----------------------------------------------------
allColoc                colocAll                    all from api/v1/internal/coloc-slim/
records                 colocClass          plot1   graph built from coloc, used for coloc class plot
colocForStudy           colocForStTi        plot3-6 allColoc matching study, tissue
recordsWithoutOneToOne  colocWithout11      plot2   records excluding oneToOneSignal
colocForStudyWithH4     colocWithStTiH4             allColoc matching study, tissue, h4
coloc                   colocWithStTiH4R2           allColoc matching study, tissue, h4, r2
countsForFigures["byOmics"] contsByOmics    plot7-8 data derived from signalsAll
allSignals              signalsAll                  all from api/v1/internal/signals-slim/
qtlStudies              qtlStudies                  map off all studies from allColoc
countsForFigures        ?                           filtered allSignals, uses colocForStudyWithH4
```

### Layers in omics per gwas plot
Top Section, gray ALL GWAS bar
- barLayerTopTotal: shows gray bar
- barLayer: overlays purple bar for sub sum
- textLayerTotalTop: text for total count over gray bar
- textLayer: shows text for purple bar sub sum
Bottom section: purple count bars
- barLayerBottom: show purple bar per GWAS
- textLayer: shows text value of each bar

To set font size of axis labels and bars in multilayer plot:
- textLayer.mark.fontSize: 14
- textLayer.encoding.y.axis.labelFontSize: 14
- textLayerTotalTop.encoding.y.axis.fontSize: 14


