const cache = {}

export const set = (key, value) => {
  cache[key] = value
}

export const get = (key) => {
  if (!hasKey(key)) {
    throw new Error(`Cache does not contain values for key ${key}.`)
  }

  return cache[key]
}

export const hasKey = key => {
  return AVAILABLE_KEYS.hasOwnProperty(key) && cache.hasOwnProperty(key)
}

export const AVAILABLE_KEYS = {
  allUrls: 'allUrls',
}
