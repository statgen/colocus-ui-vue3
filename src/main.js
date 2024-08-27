import { registerPlugins } from '@/plugins'
import VueGtag from 'vue-gtag'

import App from './App.vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import '@/styles/global.css'

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


const pinia = createPinia()
app.use(pinia)
app.use(router)

app.config.globalProperties.$log = console.log // use {{ $log(something) }} inside templates

app.mount('#app')
