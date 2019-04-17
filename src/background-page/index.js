import '@babel/polyfill'

const domainsCsv  = require('shared/domains.csv')

import * as storage from 'shared/storage'
import * as urlService from 'shared/services/url-service'
import * as annotationService from 'shared/services/annotation-service'
import * as chromeService from 'shared/services/chrome-service'
import { MESSAGE_KEYS } from 'shared/constants'


chrome.runtime.onInstalled.addListener(async function() {
  console.log({ domainsCsv })

  const allUrlsInStorage = await storage.getAllUrls()

  if (!allUrlsInStorage.length) {
    const allUrls = domainsCsv.map(row => `https://${row.Domain}.${row.Language}`)

    await storage.setAllUrls(allUrls)  
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
