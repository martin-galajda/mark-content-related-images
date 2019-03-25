import '@babel/polyfill'
const domainsCsv  = require('shared/domains.csv')
import * as storage from 'shared/storage.js'

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
