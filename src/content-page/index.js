import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import * as storage from 'shared/storage'
import { MESSAGE_KEYS } from 'shared/constants'
import { areUrlsSame } from 'shared/utils'
import { BottomPageMenu } from './bottom-page-menu'
import * as chromeService from 'shared/services/chrome-service'
import * as highlightingService from './services/highlighting-service'

const REINDEX_ELEMENTS_INTERVAL_SECONDS = 3500

/**
 * 
 * @param {Object} annotatedData 
 */
async function setupContentScript(annotatedData, {
  activeUrlHasNextAnnotated,
  activeUrlHasPrevAnnotated,
  currentUrlsPosition,
  processedUrlsCount,
  allUrlsCount
}) {
  const reactAppRoot = document.createElement('div')
  document.documentElement.appendChild(reactAppRoot)
  ReactDOM.render(<BottomPageMenu
    activeUrlHasNextAnnotated={activeUrlHasNextAnnotated}
    activeUrlHasPrevAnnotated={activeUrlHasPrevAnnotated}
    currentUrlsPosition={currentUrlsPosition}
    processedUrlsCount={processedUrlsCount}
    allUrlsCount={allUrlsCount}
  />, reactAppRoot)

  if (annotatedData) {
    const dataToRestore = annotatedData.data.annotatedElementsData
    await storage.setHighlightedElements(dataToRestore)
  } else {
    await storage.setHighlightedElements(null)
  }
  setupHighlightingElements()

  setInterval(setupHighlightingElements, REINDEX_ELEMENTS_INTERVAL_SECONDS)
}

async function setupHighlightingElements() {
  const highlightedElements = await storage.getHighlightedElements()

  const rootNode = document.getRootNode()
  highlightingService.highlightElementsInDOM(highlightedElements, rootNode)

  const elements = document.querySelectorAll('body img')

  for (const elem of elements) {
    highlightingService.highlightImgElement(highlightedElements, elem)
  }
}

async function init() {
  const [isActive] = await Promise.all([
    storage.getExtensionIsActive(),
  ])

  if (isActive) {
    chromeService.sendMessage({
      messageKey: MESSAGE_KEYS.onContentScriptLoaded,
      data: {}
    }).then(response => {
      const currentURL = window.location.href
      const {
        activeUrl,
        activeUrlAnnotatedData,
        activeUrlHasNextAnnotated,
        activeUrlHasPrevAnnotated,
        currentUrlsPosition,
        processedUrlsCount,
        allUrlsCount
      } = response

      if (areUrlsSame(currentURL, activeUrl)) {
        setupContentScript(activeUrlAnnotatedData, {
          activeUrlHasNextAnnotated,
          activeUrlHasPrevAnnotated,
          currentUrlsPosition,
          processedUrlsCount,
          allUrlsCount
        })
    
        chromeService.listenForMessage({
          messageKey: MESSAGE_KEYS.onStopWorking,
          callback: () => {
            window.location.reload()
          },
        })
    
        chromeService.listenForMessage({
          messageKey: MESSAGE_KEYS.onGoToNextPageFromPopUp,
          callback: () => {
            chromeService.sendMessage({
              messageKey: MESSAGE_KEYS.onGoToNextPage,
              data: {
                html: String(document.documentElement.innerHTML),
              }
            }).then(() => {
              // 
            })
          }
        })
      }
    })
  }
}

init().then(() => {
  console.log('Content script initialized.')  
})


