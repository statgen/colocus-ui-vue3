import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'myCustomTheme',
    variations: {
      colors: ['clcAction'],
      lighten: 4,
      darken: 4,
    },
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
  },
})

