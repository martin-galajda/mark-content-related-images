import '@babel/polyfill'

import * as storage from 'shared/storage'
import * as urlService from 'shared/services/url-service'
import * as annotationService from 'shared/services/annotation-service'
import * as chromeService from 'shared/services/chrome-service'
import * as browserCache from 'shared/cache/browser'
import * as firestore from 'shared/firestore'
import { MESSAGE_KEYS } from 'shared/constants'

const clearCache = async () => {
  await browserCache.invalidateAllItems()
  await storage.clear()

  const datasets = await firestore.listDatasets()
  const allUrls = await firestore.getAllUrls(datasets[0].id)
  await browserCache.setAllUrls(allUrls)
}

chrome.runtime.onInstalled.addListener(async function() {
  let allUrls = await browserCache.getAllUrls()

  if (!allUrls) {
    const datasets = await firestore.listDatasets()
    allUrls = await firestore.getAllUrls(datasets[0].id)
    await browserCache.setAllUrls(allUrls)  
  }
})

chromeService.listenForMessage({
  messageKey: MESSAGE_KEYS.onClearCache,
  callback: async (request, sender, sendResponse) => {
    await clearCache()
    
    sendResponse({ success: true })
  }
})

chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [
      new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {
          urlContains: 'https',
        },
      })
    ],
    actions: [
      new chrome.declarativeContent.ShowPageAction(),
    ]
  }])
})


chromeService.listenForMessage({
  messageKey: MESSAGE_KEYS.onGoToNextPage,
  callback: async (request, sender, sendResponse) => {
    await annotationService.saveAnnotatedUrl(request.data.html)
    await urlService.goToNextPage()

    sendResponse({ success: true })
  }
})

chromeService.listenForMessage({
  messageKey: MESSAGE_KEYS.onGoToNextPageWithoutSaving,
  callback: async (request, sender, sendResponse) => {
    await urlService.goToNextPageUnsaved()

    sendResponse({ success: true })
  }
})


chromeService.listenForMessage({
  messageKey: MESSAGE_KEYS.onContentScriptLoaded,
  callback: async (request, sender, sendResponse) => {

    const [userUrlsListForProcessing] = await Promise.all([
      urlService.getCurrentUserUrlsListForProcessing(),
    ])

    const res = {
      activeUrl: userUrlsListForProcessing.getCurrentUrl(),
      activeUrlAnnotatedData: userUrlsListForProcessing.getAnnotatedDataForUrl(userUrlsListForProcessing.getCurrentUrl()),
      activeUrlHasNextAnnotated: !userUrlsListForProcessing.isCurrentUrlLastNotAnnotated(),
      activeUrlHasPrevAnnotated: !userUrlsListForProcessing.isCurrentUrlFirstNotAnnotated(),
      currentUrlsPosition: userUrlsListForProcessing.currIdx + 1,
      processedUrlsCount: userUrlsListForProcessing.getProcessedUrlsLength(),
      allUrlsCount: userUrlsListForProcessing.getAllUrlsLength(),
    }

    sendResponse(res)
  }
})

chromeService.listenForMessage({
  messageKey: MESSAGE_KEYS.onGoToPrevPage,
  callback: async (request, sender, sendResponse) => {
    await urlService.goToPrevPage()

    sendResponse({ success: true })
  }
})
