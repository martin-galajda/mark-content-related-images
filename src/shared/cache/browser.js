import * as luxon from 'luxon'
import * as storage from 'shared/storage'
import * as R from 'ramda'

import { STORAGE_KEYS, PRIVATE_STORAGE_KEYS } from 'shared/constants'

const CACHEABLE_KEYS = {
  [STORAGE_KEYS.allUrls]: STORAGE_KEYS.allUrls,
  [STORAGE_KEYS.processedUrls]: STORAGE_KEYS.processedUrls,
  [STORAGE_KEYS.user]: STORAGE_KEYS.user,
  [STORAGE_KEYS.activeUrl]: STORAGE_KEYS.activeUrl,
}

// We cache data retrieved from firebase as much as possible to avoid
// making too many requests, but we want to make it functional across different devices
// so we will need to define "time-to-live" for values in our cache 
const DEFAULT_CACHE_EXPIRATION_IN_SECONDS = {

  // cache all urls for annotations for 1 hour
  [CACHEABLE_KEYS.allUrls]: 3600,

  // cache processed urls for annotations for half an hour
  [CACHEABLE_KEYS.processedUrls]: 1800,

  // cache active url (for annotating) for 1 hour
  [CACHEABLE_KEYS.activeUrl]: 3600,

  // cache any value for 1 minute
  any: 60,
}

export const getAllUrls = async () => {
  const dataInCache = await _tryToGetFromCache(STORAGE_KEYS.allUrls)
  
  return dataInCache
}

export const getProcessedUrls = async () => {
  const dataInCache = await _tryToGetFromCache(STORAGE_KEYS.processedUrls)
  
  return dataInCache
}

export const getActiveUrl = async () => {
  const dataInCache = await _tryToGetFromCache(STORAGE_KEYS.activeUrl)
  
  return dataInCache
}

export const setActiveUrl = async (newActiveUrl) => {
  const result = await _setInCache(STORAGE_KEYS.activeUrl, newActiveUrl)
  
  return result
}

export const setProcessedUrls = async (newProcessedUrls) => {
  const result = await _setInCache(STORAGE_KEYS.processedUrls, newProcessedUrls)
  
  return result
}

export const setAllUrls = async (newAllUrls) => {
  const result = await _setInCache(STORAGE_KEYS.allUrls, newAllUrls)
  
  return result
}

/**
 * Invalidates all items in our cache (forces client to fetch all items from remote storage - Firestore).
 */
export const invalidateAllItems = async () => {
  const updates = {}

  R.values(CACHEABLE_KEYS).forEach(cacheableKey => {
    updates[cacheableKey] = {
      expiresAt: null,
    }
  })

  await storage.setInStorage({
    [PRIVATE_STORAGE_KEYS.cacheMetadataInfo]: updates,
  })

  console.log('Successfully invalidated browser cache.')
}

/**
 * Adds new data value in cache under given key.
 * @param {String} dataKey Key for new data
 * @param {Object} newData Value of new data
 */
const _setInCache = async (dataKey, newData) => {
  const cacheExpirationInSeconds = DEFAULT_CACHE_EXPIRATION_IN_SECONDS[dataKey]
    || DEFAULT_CACHE_EXPIRATION_IN_SECONDS.any

  const result = await storage.setInStorage({
    [dataKey]: newData,
  })

  console.log({ dataKey }, 'Adding new cache')

  await storage.addCacheMetadataInfo(dataKey, {
    expiresAt: luxon.DateTime.utc()
      .plus({ seconds: cacheExpirationInSeconds })
      .toISO()
  })
  
  return result
}

/**
 * Method for getting values from our cache using key under which it was stored.
 * Data from cache is successfully retrieved only if its time to live is still valid.
 * 
 * @param {String} dataKey Key of data that we attempt to retrieve from cache
 */
const _tryToGetFromCache = async (dataKey) => {
  if (!R.values(CACHEABLE_KEYS).includes(dataKey)) {
    return null
  }

  const cacheMetadata = await storage.getCacheMetadataInfo(dataKey)
  if (!cacheMetadata || !cacheMetadata.expiresAt) {
    return null
  }

  const isValid = luxon.DateTime.fromISO(cacheMetadata.expiresAt) > luxon.DateTime.utc()

  if (!isValid) {
    return null
  }

  return await storage.getFromStorage({ key: dataKey })
}
