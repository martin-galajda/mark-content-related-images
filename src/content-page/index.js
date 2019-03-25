import '@babel/polyfill'
import * as storage from 'shared/storage.js'
import { MESSAGE_KEYS } from 'shared/constants';

const highlighted = {}
let currentModifiedElements = []
let highlightTimer = null

const highlightHtmlElement = (highlightedElements, imgHtmlElement) => {
  // console.log({ imgHtmlElement })

  const elemIdentifier = imgHtmlElement.getAttribute('src')


  if (!highlighted[elemIdentifier]) {
    highlighted[elemIdentifier] = true

    imgHtmlElement.setAttribute('data-orig-width', imgHtmlElement.style.width)
    imgHtmlElement.setAttribute('data-orig-height', imgHtmlElement.style.height)
    imgHtmlElement.setAttribute('data-orig-border', imgHtmlElement.style.border)

    imgHtmlElement.style.width = `${imgHtmlElement.clientWidth * 0.9}px`
    imgHtmlElement.style.height = `${imgHtmlElement.clientHeight * 0.9}px`
  }

  // console.log({ elemIdentifier })
  const isHighlighted = highlightedElements.some(highlightedElement => highlightedElement === elemIdentifier)
  imgHtmlElement.style.border = `5px solid ${isHighlighted ? 'green': 'red'}`

  imgHtmlElement.parentNode.onclick = async e => {
    e.stopPropagation()
    e.preventDefault()

    if (isHighlighted) {
      await storage.removeHighlightedElement(elemIdentifier)
    } else {
      await storage.addHighlightedElement(elemIdentifier)
    }
  }
}

function restoreHtmlElement(imgHtmlElement) {
  imgHtmlElement.style.width = imgHtmlElement.getAttribute('data-orig-width')
  imgHtmlElement.style.height = imgHtmlElement.getAttribute('data-orig-height')
  imgHtmlElement.style.border = imgHtmlElement.getAttribute('data-orig-border')
  imgHtmlElement.onClick = () => {}
}

function setupContentScript() {
  console.log('Setuping content script')
  const markup = document.documentElement.innerHTML;
  console.log({ markup })
  // alert(markup);

  highlightTimer = setInterval(setupHighlightingElements, 1000)
}

async function setupHighlightingElements() {
  currentModifiedElements = []
  const highlightedElements = await storage.getHighlightedElements()
  const elements = document.querySelectorAll( 'body img' );
  for (const elem of elements) {
    highlightHtmlElement(highlightedElements, elem)
    currentModifiedElements.push(elem)
  }
}

function stopWorking() {
  for (const elem of currentModifiedElements) {
    restoreHtmlElement(elem)
  }
  currentModifiedElements = []
  if (highlightTimer) {
    clearInterval(highlightTimer)
    highlightTimer = null  
  }
}

async function init() {
  console.log('Init content script')
  const isActive = await storage.getExtensionIsActive()

  if (isActive) {
    setupContentScript()
  }
}


function getUniqueKeyForNode (targetNode) {
  const pieces = ['doc']
  let node = targetNode

  while (node && node.parentNode) {
    pieces.push(Array.prototype.indexOf.call(node.parentNode.childNodes, node))
    node = node.parentNode
  }

  return pieces.reverse().join('/')
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.messageKey === MESSAGE_KEYS.onStopWorking && currentModifiedElements.length) {
      window.location.reload()
    }
  }
)

init().then(() => {
  console.log('Content script initialized.')  
})


