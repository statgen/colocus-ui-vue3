// Plugins
import Components from 'unplugin-vue-components/vite';
import Vue from '@vitejs/plugin-vue';
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import ViteFonts from 'unplugin-fonts/vite';

// Utilities
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { readFileSync } from 'fs';
import { marked } from 'marked';

// Custom Renderer for Marked
const renderer = new marked.Renderer();

// returns a heading tag with an embedded id equal to the lower case of heading text, separated by dashes
renderer.heading = function (textObj) {
  const text = textObj.text;
  const level = textObj.depth;
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-')
  return `
    <h${level} id="${escapedText}">
      ${text}
    </h${level}>`
};

marked.setOptions({
  renderer,
  breaks: true,
  gfm: true,
});

// Custom Markdown Plugin
function markdownPlugin() {
  return {
    name: 'markdown-html',
    enforce: 'pre',
    resolveId(id) {
      if (id.endsWith('.md')) {
        return id;
      }
      return null;
    },
    load(id) {
      if (id.endsWith('.md')) {
        console.log('*** Building markdown file:', id);
        try {
          const content = readFileSync(id, 'utf-8');
          // console.log('content', content);
          const html = marked(content);
          // console.log('html', html)
          return `export default \`${html}\`;`;
        } catch (error) {
          console.error('Error loading markdown file:', error);
          return null;
        }
      }
      return null;
    },
  };
}

// Vite Configuration
export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [
    Vue({
      template: { transformAssetUrls },
    }),
    Vuetify(),
    Components({
      dirs: ['src/components', 'src/components/misc widgets', 'src/components/FilterPanel',
        'src/components/qcPageControls'
      ],
    }),
    ViteFonts({
      google: {
        families: [{
          name: 'Roboto',
          styles: 'wght@100;300;400;500;700;900',
        }],
      },
    }),
    markdownPlugin(), // Add the custom markdown plugin here
  ],
  assetsInclude: [
    '**/*.md', // Includes all markdown files in the project
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.md',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    proxy: {
      '/api/': {
        target: process.env.VITE_API_URL || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
