import { STORAGE_KEYS, DEFAULT_STORAGE_VALUES } from 'shared/constants'

async function getFromStorage({ key }) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], function(result) {
      resolve(result[key] !== undefined ? result[key] : DEFAULT_STORAGE_VALUES[key])
    })  
  })
}

async function setInStorage(updates) {
  return new Promise(resolve => {
    chrome.storage.local.set(updates, function() {
      resolve(updates)
    })  
  })
}

export async function getStateFromStorage() {
  const localStorageState = await new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEYS, function(result) {

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
  const newHighlightedElements = currentHighlightedElements.filter(elem => elem !== elemIdentifier)
  await setInStorage({
    [STORAGE_KEYS.highlightedElements]: newHighlightedElements,
  })

  console.log(`Removed "${elemIdentifier}" from highlighted elements.`)
}

export async function addHighlightedElement(elemIdentifier) {
  const currentHighlightedElements = await getFromStorage({
    key: STORAGE_KEYS.highlightedElements,
  })
  const newHighlightedElements = currentHighlightedElements.concat([elemIdentifier])
  await setInStorage({
    [STORAGE_KEYS.highlightedElements]: newHighlightedElements,
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
    [STORAGE_KEYS.highlightedElements]: [], 
  })
}

export async function saveHighlightedElements(newProcessedUrlData) {
  const currentProcessedData = await getFromStorage({
    key: STORAGE_KEYS.processedUrlsData,
  })

  await setInStorage({
    [STORAGE_KEYS.processedUrlsData]: currentProcessedData.concat([newProcessedUrlData]), 
  })
}

export async function addProcessedUrl(newProcessedUrl) {
  const [currentlyProcessedUrls, allUrls] = await Promise.all([
    getFromStorage({
      key: STORAGE_KEYS.processedUrls,
    }),
    getFromStorage({
      key: STORAGE_KEYS.allUrls,
    }),
  ])

  await Promise.all([
    setInStorage({
      [STORAGE_KEYS.processedUrls]: currentlyProcessedUrls.concat([newProcessedUrl]),
    }),
    setInStorage({
      [STORAGE_KEYS.allUrls]: allUrls.filter((url, idx) => idx !== 0),
    }),
  ])
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

export async function clearProcessedUrls() {
  const [processedUrls, allUrls] = await Promise.all([
    getFromStorage({
      key: STORAGE_KEYS.processedUrls,
    }),
    getFromStorage({
      key: STORAGE_KEYS.allUrls,
    }),
  ])

  return setInStorage({
    [STORAGE_KEYS.processedUrls]: [],
    [STORAGE_KEYS.allUrls]: processedUrls.concat(allUrls),
    [STORAGE_KEYS.processedUrlsData]: [],
  })
}

