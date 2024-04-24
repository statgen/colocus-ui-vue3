import ColorHash from 'color-hash'

// for colorizing variant labels
const VARIANT_COLOR_MAP = [0.475]
const colorHasher = new ColorHash({ lightness: VARIANT_COLOR_MAP })

// for formatting the text of variant labels
const formatVariantString = ((variant, truncateLength = 0) => {
  const components = variant.split('_')

  components[1] = parseInt(components[1]).toLocaleString()

  let formattedVariant = components.join('_')

  if (truncateLength) {
    if (formattedVariant.length > truncateLength) {
      formattedVariant = `${formattedVariant.slice(0, truncateLength - 3)}...`
    }
  }
  return formattedVariant
})

// return true if s2 starts with s1 case-insensitive
const matchLowercase = ((s1, s2) => s2.toLowerCase().startsWith(s1.toLowerCase()))

// trim the middle between specified left and right of string
const middleTrim = (s, left=4, right=4) => {
  left = Math.max(1, left)
  right = Math.max(1, right)
  if(s.length <= left + right) return s
  return `${s.slice(0, left)}...${s.slice(-right)}`
}

// pretty print url for debugging and reducing eye strain
const ppURL = (url) => {
  let s = url.replace('?', '\n  ')
    .replace(/&/g, '\n  ')
    .replace(/%2C/g, ',')
  return s
}

export { colorHasher, formatVariantString, matchLowercase, middleTrim, ppURL }
