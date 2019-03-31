import * as storage from 'shared/storage'
import * as firestore from 'shared/firestore'

export const getUserUrlsForProcessing = async user => {
  const [allUrls, processedUrls] = await Promise.all([
    storage.getAllUrls(),
    firestore.getProcessedUrls(user)
  ])

  const userUrls = allUrls.filter(url => !processedUrls.some(processedUrl => processedUrl === url))

  return userUrls
}

export const markUrlAsProcessed = async (user) => {
  const highlightedElements = await storage.getHighlightedElements()
  const activeUrl = await storage.getActiveUrl()
  await storage.clearHighlightedElements()
  await firestore.saveProcessedUrlData(activeUrl, {
    url: activeUrl,
    highlightedElements,
  }, user)
  const nexUserUrls = await getUserUrlsForProcessing(user)
  var newURL = nexUserUrls[0]
  
  console.log({ newURL })
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, (tabs) => {
    console.log(tabs)
    chrome.tabs.update(tabs[0].id, {
      url: newURL,
    }, (tab) => {
      console.log({ tab })
    })
  })
}

export const goToNextPage = async (user) => {
  const nexUserUrls = await urlService.getUserUrlsForProcessing(user)
  var newURL = nexUserUrls[0]
  
  console.log({ newURL })
  chrome.tabs.query({
    active: true,
    currentWindow: true,
  }, (tabs) => {
    console.log(tabs)
    chrome.tabs.update(tabs[0].id, {
      url: newURL,
    }, (tab) => {
      console.log({ tab })
    })
  })
}
