import { registerPlugins } from '@/plugins'
import VueGtag from 'vue-gtag'

import App from './App.vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import '@/styles/global.css'

import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css'    // Required CSS for animations
import 'tippy.js/animations/scale.css'
import '@/styles/tippy-theme.css'   // our custom theme

import clickOutside from './directives/clickOutside'


const app = createApp(App)

registerPlugins(app)

const gaID = import.meta.env.VITE_APP_GA_ID
if (gaID) {
  app.use(VueGtag, {
    config: { id: gaID },
    appName: 'Colocus 2.0',
    pageTrackerScreenviewEnabled: true,
  }, router)
}

app.use(
  VueTippy,
  {
    directive: 'tippy', // => v-tippy
    component: 'tippy', // => <tippy/>
    componentSingleton: 'tippy-singleton',
    defaultProps: {
      arrow: true,
      placement: 'right',
      allowHTML: true,
      theme: "tippy-theme",
      animation: 'scale',
      duration: [400, 200],
      interactive: false,
    },
  }
)

const pinia = createPinia()
app.use(pinia)
app.use(router)

app.config.globalProperties.$log = console.log // use {{ $log(something) }} inside templates

app.directive('click-outside', clickOutside)

app.mount('#app')
