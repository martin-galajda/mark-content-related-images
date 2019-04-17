import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import * as storage from 'shared/storage'
import { MESSAGE_KEYS } from 'shared/constants'
import { addProtocolToImgSrcIfMissing, areUrlsSame } from 'shared/utils'
import { BottomPageMenu } from './bottom-page-menu'
import { HTMLAttributeConstants } from './constants'
import * as chromeService from 'shared/services/chrome-service'

const highlighted = {}
let currentModifiedElements = []
let highlightTimer = null

const highlightImgElement = (highlightedElements, imgHtmlElement) => {
  // console.log({ imgHtmlElement })

  const elemIdentifier = addProtocolToImgSrcIfMissing({
    currentLocationProtocol: window.location.protocol,
    url: imgHtmlElement.getAttribute('src'),
  })

  if (!highlighted[elemIdentifier]) {
    highlighted[elemIdentifier] = true

    imgHtmlElement.setAttribute('data-orig-width', imgHtmlElement.style.width)
    imgHtmlElement.setAttribute('data-orig-height', imgHtmlElement.style.height)
    imgHtmlElement.setAttribute('data-orig-border', imgHtmlElement.style.border)

    imgHtmlElement.style.width = `${imgHtmlElement.clientWidth * 0.9}px`
    imgHtmlElement.style.height = `${imgHtmlElement.clientHeight * 0.9}px`
  }

  // console.log({ elemIdentifier })
  const isHighlighted = Boolean(highlightedElements[elemIdentifier])
  imgHtmlElement.style.border = `5px solid ${isHighlighted ? 'green': 'red'}`

  imgHtmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_PATH_FROM_ROOT, getPathFromDocRoot(imgHtmlElement))
  imgHtmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_ID, elemIdentifier)

  currentModifiedElements[elemIdentifier] = imgHtmlElement

  imgHtmlElement.parentNode.onclick = async e => {
    e.stopPropagation()
    e.preventDefault()

    const elemPathToRoot = getPathFromDocRoot(imgHtmlElement)

    if (isHighlighted) {
      await storage.removeHighlightedElement(elemIdentifier)
      imgHtmlElement.style.border = `5px solid red`

    } else {
      await storage.addHighlightedElement(elemIdentifier, {
        url: elemIdentifier,
        elemPathToRoot,
      })
      imgHtmlElement.style.border = `5px solid green`
    }
  }
}


function setupContentScript() {
  const reactAppRoot = document.createElement('div')
  document.documentElement.appendChild(reactAppRoot)
  ReactDOM.render(<BottomPageMenu />, reactAppRoot)

  highlightTimer = setInterval(setupHighlightingElements, 1000)
}

async function setupHighlightingElements() {
  const highlightedElements = await storage.getHighlightedElements()
  const elements = document.querySelectorAll('body img')

  for (const elem of elements) {
    highlightImgElement(highlightedElements, elem)
  }
}

async function init() {
  const [isActive, activeURL] = await Promise.all([
    storage.getExtensionIsActive(),
    storage.getActiveUrl(),
  ])
  const currentURL = window.location.href

  if (isActive && areUrlsSame(currentURL, activeURL)) {
    setupContentScript()

    chromeService.listenForMessage({
      messageKey: MESSAGE_KEYS.onStopWorking,
      callback: () => {
        if (Object.keys(currentModifiedElements).length) {
          window.location.reload()
        }
      }
    })

    chromeService.listenForMessage({
      messageKey: MESSAGE_KEYS.onGoToNextPageFromPopUp,
      callback: async () => {
        const response = await chromeService.sendMessage({
          messageKey: MESSAGE_KEYS.onGoToNextPage,
          data: {
            html: String(document.documentElement.innerHTML),
          }
        })
    
        console.log({ response })
      }
    })
  }
}

function getPathFromDocRoot (targetNode) {
  const pieces = []
  let node = targetNode

  while (node && node.parentNode) {
    pieces.push(Array.prototype.indexOf.call(node.parentNode.childNodes, node))
    node = node.parentNode
  }

  const pathFromRoot = pieces
    .reverse()
    .join('/')

  return `doc/${pathFromRoot}`
}

init().then(() => {
  console.log('Content script initialized.')  
})


