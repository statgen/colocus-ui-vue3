import { registerPlugins } from '@/plugins'

import App from './App.vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import '@/styles/global.css'

const app = createApp(App)

registerPlugins(app)

const pinia = createPinia()
app.use(pinia)
app.use(router)

app.config.globalProperties.$log = console.log // use $log(something) inside templates, eg: {{ $log(something) }}

app.mount('#app')
