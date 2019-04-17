import { STORAGE_KEYS, DEFAULT_STORAGE_VALUES } from 'shared/constants'
import * as R from 'ramda'

async function getFromStorage({ key }) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], function(result) {
      resolve(result[key] !== undefined ? result[key] : DEFAULT_STORAGE_VALUES[key])
    })
  })
}

async function setInStorage(updates) {
  return new Promise(resolve => {
    chrome.storage.local.set({
      ...updates,
    }, function() {
      resolve(updates)
    })  
  })
}

export async function getStateFromStorage() {
  const localStorageState = await new Promise(resolve => {
    chrome.storage.local.get(Object.values(STORAGE_KEYS), function(result) {

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

  console.log(`Removed "${elemIdentifier}" from highlighted elements.`)
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

  console.log(`Added "${elemIdentifier}" to highlighted elements.`)
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
  return setInStorage({
    [STORAGE_KEYS.extensionIsActive]: isActive,
  })
}

export async function getAllUrls() {
  return getFromStorage({
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


export async function addProcessedUrl(processedUrl) {
  const oldProcessedUrls = await getFromStorage({
    key: STORAGE_KEYS.processedUrls,
  })

  await setInStorage({
    [STORAGE_KEYS.processedUrls]: R.uniq(oldProcessedUrls.concat([processedUrl])), 
  })
}

export async function clearProcessedUrls() {
  return setInStorage({
    [STORAGE_KEYS.processedUrls]: [],
  })
}

export async function setActiveUrl(activeUrl) {
  await setInStorage({
    [STORAGE_KEYS.activeUrl]: activeUrl,
  })
}

export async function getActiveUrl() {
  return getFromStorage({
    key: STORAGE_KEYS.activeUrl,
  })
}

export async function setUserInStorage(user) {
  return setInStorage({
    [STORAGE_KEYS.user]: user,
  })
}

export async function getUserFromStorage() {
  return getFromStorage({
    key: STORAGE_KEYS.user,
  })
}

export async function setAccessToken(token) {
  return setInStorage({
    [STORAGE_KEYS.accessToken]: token,
  })
}

export async function getAccessToken() {
  return getFromStorage({
    key: STORAGE_KEYS.accessToken,
  })
}
