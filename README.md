# Colocus V 2.0

This is a Vue 3 app built using Vuetify 3. It is loosely based on the Vue 2/Vuetify 2 app.

## Page structure
Overall page structure is defined in App.vue, which simply loads the toolbar, provides a <v-main> section, where router views are displayed, followed by the footer. The <v-main> section is a Vuetify <v-row>. Each page of the application pages is defined in a separate file in the src/views folder. Each view file will typically wrap their content in Vuetify <v-col> elements. 

## FilterPanel
The <FilterPanel> component is completely defined in a separate folder under src/components. It consists of several subpanels, each of which contains a set of controls. Key elements of the <FilterPanel> component include the following:
- a template section that defines the component hierarchy.
- a data structure, controlConfig, that contains configuration data for all of the controls
- regex patterns used for input validation
- rule functions used for input validation

Standard Vue props pass key data elements down to the subpanels and individual controls.

Each subpanel has an optional reset button, which will reset its contained controls back to a default state, which is passed to the controls via the controlSet prop, as specified in the top level <FilterPanel>. The subpanels and controls utilize Vue 3's provide/inject mechanism to dynamically pass messages. For example, when the user clicks the Reset button, it flips the value of a local ref variable, resetInput, and that variable is used by the provide mechanism.

Then, in the underlying controls, Vue's inject mechanism allows monitoring of that variable's state. When the state changes, the control reloads itself, and updates the Pinia store with the default value.

All of the underlying controls are composites, consisting of a text label, whose value is passed in as a prop (controlSet.title), plus a wrapper around a standard Vuetify control (AutoComplete, TextField, Switch).

The <CtlAutocomplete> component also listens for changes to a second injected signal, loadFPControls. This is provided by the top level pages (Search and LocusZoom), and is toggled in their onMounted events, when it is safe to assume that the search metadata API call has returned and stored its results in the Pinia store. So when a <CtlAutocomplete> sees that flag toggled, it loads the select list with the appropriate data from Pinia. The <CtlAutoComplete> control also loads its own (user) data in the onMounted event. This is needed when transitioning between the Search and LocusZoom pages, and other pages. The function populateControlData handles this, including a mapping from the current page name, so that it knows which data element in the Pinia store to access. Last, a modelChanged function updates the store upon user input.

The <CtlSwitch> component is similar, but simpler. It also listens for a reset signal, and responds to user input by updating the Pinia store.

The <CtlTextfield> component is similar. It also listens for a reset signal, and responds to user input by updating the Pinia store. It also debounces user input, to avoid needlessly triggering API calls upon incomplete input. It also applies the passed-in rule to the user input. On invalid input, a message, which is actually part of the rule definition in <FilterPanel> is displayed in red by the control. The only other thing of note is a function, trapEmpty, that checks whether the control has a value when it loses focus, and if not, provides an 'empty' value, passed in from the data structure in the parent <FilterPanel>.

## Search metadata loading
There is a Vue 3 composable, featchData.js, that handles data loading. Getting it working was tricky, so worthy of some explanation. Initially I tried loading the search metadata in the App.vue file, but it actually loads its elements in an async manner. So, for example, you can't assume that the Pinia store is ready when loading a page such as Search. Normally it would be, as you would access it after loading the Home page. But if you force-reload on the Search page, the page will display before the store is ready. This would also occur if a user bookmarked the search page (even though at present their filter settings would not be restored on direct access to the page).

The most reliable way I found to load the search metadata was to use the route guard, beforeEach. It calls a local function, loadFilterData, which checks a flag on the store to see if data is loaded, and if not, calls the store's loadFilterData function.

## Pinia store

Currently, there is one Pinia store, and it holds all app state. At the top level, this includes flags for whether the filter panel and filter button are displayed, and whether data is loaded. Then there is a variable for count_pairs, which is returned by the API call, along with the data for the select lists (analysis types, genes, phenotypes, studies, and tissues). These five latter are stored under the key, staticData. Then there are keys for searchPageData and locusZoomPageData, which store the run-time values entered or selected by the user.

The most important action method is loadFilterData, which is an async function that in turn relies on the async composable, fetchData.js. LoadFilterData calls the composable and either throws an error or populates the staticData keys for use by the FilterPanel controls.

The action updateFilter is a helper for the filter panel components. updateFilter updates the appropriate value in the appropriate key, depending on which page (Search or LocusZoom) the user is on.

The action toggleFilterPanel is used by the <Toolbar> to show and hide the filter panel.

The action CopySearchFilterToLZ copies the filter panel data for the search page into the corresponding keys for the LocusZoom page, and is called by the router before entering the LocusZoom page.

## Router
For most pages, the router simply provides a link to the corresponding view file. The Search and LocusZoom pages enable the filter panel and button, and the LocusZoom page copies user filter panel selections and entries from the Search page data.

There is a global route guard, beforeEach, which disables the filter panel and calls the local loadFilterData function, which in turn calls the loader in the Pinia store if needed.

## Styling
A key design goal of this iteration of Colocus was to centralize style definitions as much as possible. Vuetify has an extensive color management system, based on Google's Material Design, but it only covers Vuetiy components, not native HTML elements, such as headings. The solution is to define a custom theme in the Vuetify loader, and then have a global css file that references variables from it. (The global css file is imported in main.js.)

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
