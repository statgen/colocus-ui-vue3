
// return true if s2 starts with s1 case-insensitive
const matchLowercase = ((s1, s2) => {
  return s2.toLowerCase().startsWith(s1.toLowerCase())
})

export { matchLowercase }
