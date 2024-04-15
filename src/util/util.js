// return true if s2 starts with s1 case-insensitive
const matchLowercase = ((s1, s2) => {
  return s2.toLowerCase().startsWith(s1.toLowerCase())
})

// trim the middle between specified left and right of string
const middleTrim = (s, left=4, right=4) => {
  left = Math.max(1, left)
  right = Math.max(1, right)
  if(s.length <= left + right) return s
  return `${s.slice(0, left)}...${s.slice(-right)}`
}

import ColorHash from 'color-hash'
import { VARIANT_COLOR_MAP } from '@/constants'
const colorHasher = new ColorHash({ lightness: VARIANT_COLOR_MAP })

// pretty print url for debugging and reducing eye strain
const ppURL = (url) => {
  let s = url.replace('?', '\n  ')
    .replace(/&/g, '\n  ')
    .replace(/%2C/g, ',')
  return s
}

export { matchLowercase, middleTrim, colorHasher, ppURL }
