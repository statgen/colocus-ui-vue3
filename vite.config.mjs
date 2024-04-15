// Plugins
import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    Vue({
      template: { transformAssetUrls }
    }),
    Vuetify(),
    Components({
      dirs: ['src/components', 'src/components/widgets', 'src/components/FilterPanel'], // add component directories here
    }),
    ViteFonts({
      google: {
        families: [{
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    proxy: {
      // Proxying API requests similar to the Vue CLI setup
      '/api/': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true, // required to avoid CORS issues if the target server has CORS enabled
        // ws: true, // set to true if you want to proxy websockets
        // Additional configurations if needed
        // rewrite: (path) => path.replace(/^\/api/, '')
      },
    },
  },

})
