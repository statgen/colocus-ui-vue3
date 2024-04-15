import { ref, watchEffect } from 'vue'

export function useDirectionOfEffect(items) {
  const results = ref({})

  watchEffect(() => {
    const newResults = {}
    for (const item of items) {
      newResults[item.uuid] = getEffectDirectBetweenTraits(item.cross_signal.effect)
    }
    results.value = newResults
  })

  return results
}

const getEffectDirectBetweenTraits = ((effects) => {
  let discord = false
  let direction = null
  let hasMissing = false

  for (let i = 0; i < effects.length; i++) {
    for (let j = 0; j < effects[i].length; j++) {
      if (effects[i][j] === null || Number.isNaN(effects[i][j])) {
        hasMissing = true
        discord = false
        effects[i][j] = NaN
      }
    }
  }

  const v1 = effects[0][0] * effects[0][1]
  const v2 = effects[1][0] * effects[1][1]
  const d1 = v1 > 0
  const d2 = v2 > 0

  if (hasMissing) {
    discord = false
    if (Number.isNaN(v1) && Number.isNaN(v2)) {
      direction = null
    } else {
      if (Number.isNaN(v1)) {
        direction = d2 > 0 ? '+' : '-'
      } else {
        direction = d1 > 0 ? '+' : '-'
      }
    }
  } else {
    discord = d1 !== d2
    direction = d1 ? '+' : '-'
  }

  return {
    discord,
    direction,
    hasMissing
  }
})
