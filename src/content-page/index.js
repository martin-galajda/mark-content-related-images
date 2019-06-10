import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import * as storage from 'shared/storage'
import { MESSAGE_KEYS } from 'shared/constants'
import { areUrlsSame } from 'shared/utils'
import { BottomPageMenu } from './bottom-page-menu'
import * as chromeService from 'shared/services/chrome-service'
import * as highlightingService from './services/highlighting-service'

/**
 * 
 * @param {Object} annotatedData 
 */
async function setupContentScript(annotatedData, { activeUrlHasNextAnnotated, activeUrlHasPrevAnnotated }) {
  const reactAppRoot = document.createElement('div')
  document.documentElement.appendChild(reactAppRoot)
  ReactDOM.render(<BottomPageMenu
    activeUrlHasNextAnnotated={activeUrlHasNextAnnotated}
    activeUrlHasPrevAnnotated={activeUrlHasPrevAnnotated}  
  />, reactAppRoot)

  setInterval(setupHighlightingElements, 1000)

  console.log({ annotatedData })
  
  if (annotatedData) {
    const dataToRestore = annotatedData.data.annotatedElementsData
    console.log({ dataToRestore })

    await storage.setHighlightedElements(dataToRestore)
  } else {
    await storage.setHighlightedElements(null)
  }
}

async function setupHighlightingElements() {
  const highlightedElements = await storage.getHighlightedElements()
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
      const { activeUrl, activeUrlAnnotatedData, activeUrlHasNextAnnotated, activeUrlHasPrevAnnotated } = response

      if (areUrlsSame(currentURL, activeUrl)) {
        setupContentScript(activeUrlAnnotatedData, { activeUrlHasNextAnnotated, activeUrlHasPrevAnnotated })
    
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


