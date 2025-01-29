import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { COLORS } from '@/constants'

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
          clcBackground: COLORS.CLC_BACKGROUND,
          clcAction: COLORS.CLC_ACTION,
          clcHeading: COLORS.CLC_HEADING,
          clcAmpBlue: COLORS.CLC_AMPBLUE,
          clcEffPos: COLORS.CLC_EFF_POS,
          clcEffNeg: COLORS.CLC_EFF_NEG,
          clcEffZero: COLORS.CLC_EFF_ZERO,
          clcEffNA: COLORS.CLC_EFF_NA,
          clcTableHighlight: COLORS.CLC_TABLE_HIGHLIGHT,
          clcTooltipBackground: COLORS.CLC_TOOLTIP_BACKGROUND,
          clcTooltipBorder: COLORS.CLC_TOOLTIP_BORDER,
        },
      },
    },
  },
})
