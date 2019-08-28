import * as storage from 'shared/storage'
import { addProtocolToImgSrcIfMissing } from 'shared/utils'
import { HTMLAttributeConstants, HTMLClasses } from '../constants'
import { getPathFromDocRoot } from '../utils'
import nanoid from 'nanoid'

const highlighted = {}
let currentModifiedElements = {}

const BORDER_STYLE_NOT_HIGHLIGHTED = '5px solid red'
const BORDER_STYLE_HIGHLIGHTED = '5px solid green'

const isElementPartOfExtensionUI = event => {
  if (event.path.some(elemOnPath => elemOnPath.classList && elemOnPath.classList.contains(HTMLClasses.EXTENSION_ROOT_ELEM_CLASS))) {
    return true
  }

  return false
}

const makeOnClickHandler = (htmlElement, imgUrl, isHighlighted, callbackOnHighlighting) => {

  let imgUrlBase64 = ''
  try {
    // can fail in rare cases for some illegal characters
    imgUrlBase64 = btoa(imgUrl)
  } catch (err) {
    console.error({ err })
  }

  return async e => {
    if (isElementPartOfExtensionUI(e)) {
      return
    }

    e.stopPropagation()
    e.preventDefault()

    const elemPathFromRoot = getPathFromDocRoot(htmlElement)

    if (isHighlighted) {
      await storage.removeHighlightedElement(imgUrl)
      htmlElement.style.border = BORDER_STYLE_NOT_HIGHLIGHTED

    } else {
      await storage.addHighlightedElement(imgUrl, {
        url: imgUrl,
        dataAnnotationId: htmlElement.getAttribute(HTMLAttributeConstants.DATA_ANNOTATION_ID),
        imgUrlBase64,
        elemPathFromRoot,
      })
      htmlElement.style.border = BORDER_STYLE_HIGHLIGHTED
    }

    callbackOnHighlighting()
  }
}

export const highlightImgElement = (highlightedElements, imgHtmlElement, callbackOnHighlighting) =>
  highlightHtmlElement(highlightedElements, imgHtmlElement, imgHtmlElement.getAttribute('src'), callbackOnHighlighting)

export const highlightHtmlElement = (highlightedElements, htmlElement, url, callbackOnHighlighting) => {
  if (!url) {
    return
  }
  
  const imgUrl = addProtocolToImgSrcIfMissing({
    currentLocationProtocol: window.location.protocol,
    host: window.location.host,
    url,
  })

  let imgUrlBase64 = ''
  try {
    // can fail in rare cases for some illegal characters
    imgUrlBase64 = btoa(imgUrl)
  } catch (err) {
    console.error({ err })
  }

  if (!highlighted[imgUrl]) {
    highlighted[imgUrl] = true

    htmlElement.setAttribute('data-orig-width', htmlElement.style.width)
    htmlElement.setAttribute('data-orig-height', htmlElement.style.height)
    htmlElement.setAttribute('data-orig-border', htmlElement.style.border)

    htmlElement.style.width = `${htmlElement.clientWidth * 0.9}px`
    htmlElement.style.height = `${htmlElement.clientHeight * 0.9}px`

    htmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_ID, nanoid())
  }

  const isHighlighted = Boolean(highlightedElements[imgUrl])
  htmlElement.style.border = isHighlighted ? BORDER_STYLE_HIGHLIGHTED : BORDER_STYLE_NOT_HIGHLIGHTED

  htmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_PATH_FROM_ROOT, getPathFromDocRoot(htmlElement))
  htmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_URL, imgUrl)
  htmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_URL_BASE64, imgUrlBase64)

  currentModifiedElements[imgUrl] = htmlElement

  htmlElement.parentNode.onclick = makeOnClickHandler(htmlElement, imgUrl, isHighlighted, callbackOnHighlighting) 
  htmlElement.onclick = makeOnClickHandler(htmlElement, imgUrl, isHighlighted, callbackOnHighlighting) 
}

export const highlightElementsInDOM = (highlightedElements, documentRootNode, callbackOnHighlighting) => {
  const rootNode = documentRootNode
  const stack = [rootNode]

  while (stack.length) {
    const elem = stack.pop()
    const elemStyles = elem.style

    for (const childNode of elem.childNodes) {
      stack.push(childNode)
    }

    const backgroundImage = elemStyles && elemStyles['backgroundImage']

    let highlighted = false
    if (backgroundImage) {
      // try extracting url from background-image styles of the element
      const match = /url\("(?<url>.*)"\)/.exec(backgroundImage)

      if (match && match.groups && match.groups.url) {
        highlightHtmlElement(highlightedElements, elem, match.groups.url, callbackOnHighlighting)
        highlighted = true
      }
    }
    
    if (!highlighted) {
      elem.onClick = e => {
        if (!isElementPartOfExtensionUI(e)) {
          e.preventDefault()
          e.stopPropagation()  
        }
      }
    }
  }
}
