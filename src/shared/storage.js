import {
  STORAGE_KEYS,
  DEFAULT_STORAGE_VALUES,
  PRIVATE_STORAGE_KEYS,
  REMOVABLE_KEYS,
} from 'shared/constants'

export async function getFromStorage({ key }) {
  return await new Promise(resolve => {
    chrome.storage.local.get([key], function(result) {
      resolve(result[key] !== undefined ? result[key] : DEFAULT_STORAGE_VALUES[key])
    })
  })
}

export async function setInStorage(updates) {
  return await new Promise(resolve => {
    chrome.storage.local.set({
      ...updates,
    }, function() {
      resolve(updates)
    })  
  })
}

export async function clear() {
  return await new Promise((resolve, reject) => {
    chrome.storage.local.remove(REMOVABLE_KEYS, function() {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      }

      resolve()
    })
  })
}

export async function getStateFromStorage() {
  const allKeys = Object.values(STORAGE_KEYS).concat(Object.values(PRIVATE_STORAGE_KEYS))
  const localStorageState = await new Promise(resolve => {
    chrome.storage.local.get(allKeys, function(result) {

      Object.values(STORAGE_KEYS).forEach(storageKey => {
        result[storageKey] = result[storageKey] || DEFAULT_STORAGE_VALUES[storageKey]
      })

      resolve(result)
    })  
  })

  return localStorageState
}

export async function removeHighlightedElement(elemIdentifier) {
  const currentHighlightedElements = await getFromStorage({
    key: STORAGE_KEYS.highlightedElements,
  })
  const newHighlightedElements = {
    ...currentHighlightedElements,
  }

  delete newHighlightedElements[elemIdentifier]

  await setInStorage({
    [STORAGE_KEYS.highlightedElements]: newHighlightedElements,
  })
}

export async function addHighlightedElement(elemIdentifier, highlightedElementData) {
  const currentHighlightedElements = await getFromStorage({
    key: STORAGE_KEYS.highlightedElements,
  })
  await setInStorage({
    [STORAGE_KEYS.highlightedElements]: {
      ...currentHighlightedElements,
      [elemIdentifier]: highlightedElementData,
    },
  })
}

export async function setHighlightedElements(highlightedElementData) {
  return await setInStorage({
    [STORAGE_KEYS.highlightedElements]: {
      ...highlightedElementData,
    },
  })
}

export async function getHighlightedElements() {
  const currentHighlightedElements = await getFromStorage({
    key: STORAGE_KEYS.highlightedElements,
  })

  return currentHighlightedElements
}

export async function getExtensionIsActive() {
  const isActive = await getFromStorage({
    key: STORAGE_KEYS.extensionIsActive,
  })

  return isActive
}

export async function setExtensionIsActive(isActive) {
  return await setInStorage({
    [STORAGE_KEYS.extensionIsActive]: isActive,
  })
}

export async function getAllUrls() {
  return await getFromStorage({
    key: STORAGE_KEYS.allUrls, 
  })
}

export async function setAllUrls(allUrls) {
  await setInStorage({
    [STORAGE_KEYS.allUrls]: allUrls, 
  })
}

export async function clearHighlightedElements() {
  await setInStorage({
    [STORAGE_KEYS.highlightedElements]: {}, 
  })
}

export async function setActiveUrl(activeUrl) {
  await await setInStorage({
    [STORAGE_KEYS.activeUrl]: activeUrl,
  })
}

export async function getActiveUrl() {
  return await getFromStorage({
    key: STORAGE_KEYS.activeUrl,
  })
}

export async function setUserInStorage(user) {
  return await setInStorage({
    [STORAGE_KEYS.user]: user,
  })
}

export async function getUserFromStorage() {
  return await getFromStorage({
    key: STORAGE_KEYS.user,
  })
}

export async function setAccessToken(token) {
  return await setInStorage({
    [STORAGE_KEYS.accessToken]: token,
  })
}

export async function getAccessToken() {
  return await getFromStorage({
    key: STORAGE_KEYS.accessToken,
  })
}

export async function setProcessedUrlsCurrIdx(newCurrIdx) {
  return await setInStorage({
    [STORAGE_KEYS.processedUrlsListCurrIdx]: newCurrIdx,
  })
}

export async function getProcessedUrlsCurrIdx() {
  return await getFromStorage({
    key: STORAGE_KEYS.processedUrlsListCurrIdx,
  })
}

export async function setIsSignedIn(isSignedIn) {
  return await setInStorage({
    [STORAGE_KEYS.isSignedIn]: isSignedIn,
  })
}

export async function getIsSignedIn() {
  return await getFromStorage({ key: STORAGE_KEYS.isSignedIn })
}

getFromStorage({
  key: PRIVATE_STORAGE_KEYS.cacheMetadataInfo,
}).then(currentCacheMetadataInfo => {
  console.log({ currentCacheMetadataInfo })
})

export async function addCacheMetadataInfo(cacheElemIdentifier, metadata) {
  const currentCacheMetadataInfo = await getFromStorage({
    key: PRIVATE_STORAGE_KEYS.cacheMetadataInfo,
  })

  await setInStorage({
    [PRIVATE_STORAGE_KEYS.cacheMetadataInfo]: {
      ...currentCacheMetadataInfo,
      [cacheElemIdentifier]: metadata,
    },
  })
}

export async function getCacheMetadataInfo(cacheElemIdentifier) {
  const currentCacheMetadataInfo = await getFromStorage({
    key: PRIVATE_STORAGE_KEYS.cacheMetadataInfo,
  })

  if (currentCacheMetadataInfo) {
    return currentCacheMetadataInfo[cacheElemIdentifier]
  } 

  return null
}
