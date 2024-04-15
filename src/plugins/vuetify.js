import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'myCustomTheme',
    variations: {
      colors: ['clcAction', 'clcEffPos', 'clcEffNeg'],
      lighten: 4,
      darken: 4,
    },
    themes: {
      myCustomTheme: {
        dark: false,
        colors: {
          something: '#00ff00' ,
          clcBackground: '#fafafa',   // css: aliceblue: '#f0f8ff'
          clcAction: '#18c11c', //'#F57C00',       // md: orange-darken-2: '#F57C00'
          clcHeading: '#1E88E5',      // md: blue-darken-1: '#1E88E5'
          clcAmpBlue: '#0097d6',
          clcEffPos: '#e3fdff', //'#91bfdb', // '#fc8d59',
          clcEffNeg: '#ffd1c7', //'#fc8d59', //'#91bfdb',
          clcEffZero: '#dddddd',
          clcEffNA: '#ffffff',
        },
      },
    },
  },
})
