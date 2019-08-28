import '@babel/polyfill'

import * as storage from 'shared/storage'
import * as urlService from 'shared/services/url-service'
import * as annotationService from 'shared/services/annotation-service'
import * as chromeService from 'shared/services/chrome-service'
import { MESSAGE_KEYS } from 'shared/constants'
import * as auth from 'shared/auth'


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
    const currentTab = await chromeService.getCurrentTab()
    await Promise.all([
      storage.setCanNavigateToDifferentURL(true),
      annotationService.saveAnnotatedUrl(request.data.html)
    ])
    await urlService.goToNextPageInTab(currentTab)

    sendResponse({ success: true })
  }
})

chromeService.listenForMessage({
  messageKey: MESSAGE_KEYS.onGoToNextPageWithoutSaving,
  callback: async (request, sender, sendResponse) => {
    await storage.setCanNavigateToDifferentURL(true)
    await urlService.goToNextPageUnsaved()

    sendResponse({ success: true })
  }
})


chromeService.listenForMessage({
  messageKey: MESSAGE_KEYS.onContentScriptLoaded,
  callback: async (request, sender, sendResponse) => {
    const [activeUrl, user] = await Promise.all([
      urlService.getActiveUrl(),
      auth.getUser(await storage.getAccessToken()),
    ])
    const navigationInfo = await urlService.getNavigationInfo(user)
    const activeUrlAnnotatedData = await urlService.getProcessedUrlData(activeUrl, user)

    const res = {
      activeUrl: activeUrl,
      activeUrlAnnotatedData: activeUrlAnnotatedData,
      activeUrlHasNextAnnotated: navigationInfo.hasNext,
      activeUrlHasPrevAnnotated: navigationInfo.hasPrev,
      currentUrlsPosition: navigationInfo.currentPosition + 1,
      processedUrlsCount: navigationInfo.processedUrlsCount,
      markedImagesCount: navigationInfo.markedImagesCount,
      allUrlsCount: navigationInfo.allUrlsCount,
    }

    sendResponse(res)
  }
})

chromeService.listenForMessage({
  messageKey: MESSAGE_KEYS.onGoToPrevPage,
  callback: async (request, sender, sendResponse) => {
    await storage.setCanNavigateToDifferentURL(true)
    await urlService.goToPrevPage()

    sendResponse({ success: true })
  }
})
