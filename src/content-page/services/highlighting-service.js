import * as storage from 'shared/storage'
import { addProtocolToImgSrcIfMissing } from 'shared/utils'
import { HTMLAttributeConstants } from '../constants'
import { getPathFromDocRoot } from '../utils'
import nanoid from 'nanoid'

const highlighted = {}
let currentModifiedElements = {}

const BORDER_STYLE_NOT_HIGHLIGHTED = '5px solid red'
const BORDER_STYLE_HIGHLIGHTED = '5px solid green'

export const highlightImgElement = (highlightedElements, imgHtmlElement) => {
  const imgUrl = addProtocolToImgSrcIfMissing({
    currentLocationProtocol: window.location.protocol,
    url: imgHtmlElement.getAttribute('src'),
  })
  const imgUrlBase64 = btoa(imgUrl)

  if (!highlighted[imgUrl]) {
    highlighted[imgUrl] = true

    imgHtmlElement.setAttribute('data-orig-width', imgHtmlElement.style.width)
    imgHtmlElement.setAttribute('data-orig-height', imgHtmlElement.style.height)
    imgHtmlElement.setAttribute('data-orig-border', imgHtmlElement.style.border)

    imgHtmlElement.style.width = `${imgHtmlElement.clientWidth * 0.9}px`
    imgHtmlElement.style.height = `${imgHtmlElement.clientHeight * 0.9}px`

    imgHtmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_ID, nanoid())
  }

  const isHighlighted = Boolean(highlightedElements[imgUrl])
  imgHtmlElement.style.border = isHighlighted ? BORDER_STYLE_HIGHLIGHTED : BORDER_STYLE_NOT_HIGHLIGHTED

  imgHtmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_PATH_FROM_ROOT, getPathFromDocRoot(imgHtmlElement))
  imgHtmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_URL, imgUrl)
  imgHtmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_URL_BASE64, imgUrlBase64)

  currentModifiedElements[imgUrl] = imgHtmlElement

  imgHtmlElement.parentNode.onclick = async e => {
    e.stopPropagation()
    e.preventDefault()

    const elemPathFromRoot = getPathFromDocRoot(imgHtmlElement)

    if (isHighlighted) {
      await storage.removeHighlightedElement(imgUrl)
      imgHtmlElement.style.border = BORDER_STYLE_NOT_HIGHLIGHTED

    } else {
      await storage.addHighlightedElement(imgUrl, {
        url: imgUrl,
        dataAnnotationId: imgHtmlElement.getAttribute(HTMLAttributeConstants.DATA_ANNOTATION_ID),
        imgUrlBase64,
        elemPathFromRoot,
      })
      imgHtmlElement.style.border = BORDER_STYLE_HIGHLIGHTED
    }
  }
}

export const highlightHtmlElement = (highlightedElements, htmlElement, url) => {
  const imgUrl = addProtocolToImgSrcIfMissing({
    currentLocationProtocol: window.location.protocol,
    url: url,
  })
  const imgUrlBase64 = btoa(imgUrl)

  if (!highlighted[imgUrl]) {
    highlighted[imgUrl] = true

    htmlElement.setAttribute('data-orig-width', htmlElement.style.width)
    htmlElement.setAttribute('data-orig-height', htmlElement.style.height)
    htmlElement.setAttribute('data-orig-border', htmlElement.style.border)

    htmlElement.style.width = `${htmlElement.clientWidth * 0.9}px`
    htmlElement.style.height = `${htmlElement.clientHeight * 0.9}px`

    htmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_ID, nanoid())

    htmlElement.parentNode.onclick = async e => {
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
    }
  }

  const isHighlighted = Boolean(highlightedElements[imgUrl])
  htmlElement.style.border = isHighlighted ? BORDER_STYLE_HIGHLIGHTED : BORDER_STYLE_NOT_HIGHLIGHTED

  htmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_PATH_FROM_ROOT, getPathFromDocRoot(htmlElement))
  htmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_URL, imgUrl)
  htmlElement.setAttribute(HTMLAttributeConstants.DATA_ANNOTATION_URL_BASE64, imgUrlBase64)

  currentModifiedElements[imgUrl] = htmlElement
}

export const highlightElementsInDOM = (highlightedElements, documentRootNode) => {
  const rootNode = documentRootNode
  const stack = [rootNode]

  while (stack.length) {
    const elem = stack.pop()
    const elemStyles = elem.style

    for (const childNode of elem.childNodes) {
      stack.push(childNode)
    }

    if (!elemStyles) {
      continue
    }

    const backgroundImage = elemStyles['backgroundImage']

    if (backgroundImage) {
      // try extracting url from background-image styles of the element
      const match = /url\("(?<url>.*)"\)/.exec(backgroundImage)

      if (match && match.groups && match.groups.url) {
        highlightHtmlElement(highlightedElements, elem, match.groups.url)
      }
    }
  }
}
