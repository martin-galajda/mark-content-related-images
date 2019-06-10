import * as utils from 'shared/utils'

export class UserUrlsList {
  
  constructor(allUrls, processedUrlsWithAnnotationData, currIdx) {
    this.allUrls = allUrls
    this.processedUrlsWithAnnotationData = processedUrlsWithAnnotationData
    const userProcessedUrls = processedUrlsWithAnnotationData.map(data => data.url)
    
    this.userProcessedUrls = userProcessedUrls
    let minNotAnnotatedIdx = allUrls.length - 1
    let maxAnnotatedIdx = -1

    let annotatedFound = false
    this.allUrls.forEach((url, idx) => {
      const alreadyProcessed = userProcessedUrls
        .some(processedUrl => utils.areUrlsSame(processedUrl, url))

      if (!alreadyProcessed && !annotatedFound) {
        minNotAnnotatedIdx = idx
        annotatedFound = true
      } else if (alreadyProcessed) {
        maxAnnotatedIdx = idx
      }
    })

    this.minNotAnnotatedIdx = minNotAnnotatedIdx
    this.maxAnnotatedIdx = maxAnnotatedIdx

    this.currIdx = currIdx !== undefined ? currIdx : this.minNotAnnotatedIdx
    this.prevIdx = Math.max(0, this.currIdx - 1)
    this.nextIdx = Math.min(allUrls.length - 1, this.currIdx + 1)
  }

  isCurrentUrlLastNotAnnotated() {
    return this.currIdx - 1 === this.maxAnnotatedIdx
  }

  isCurrentUrlFirstNotAnnotated() {
    return this.currIdx === 0
  }


  getCurrentUrl() {
    return this.allUrls[this.currIdx]
  }

  getNextUrl() {
    return this.allUrls[this.nextIdx]
  }

  getPrevUrl() {
    return this.allUrls[this.prevIdx]
  }

  getMinNotAnnotatedIdx() {
    return this.minNotAnnotatedIdx
  }

  getMaxAnnotatedIdx() {
    return this.maxAnnotatedIdx
  }

  setCurrentIdx(newCurrIdx) {
    if (newCurrIdx < 0 || newCurrIdx > this.minNotAnnotatedIdx) {
      throw new Error(`Index out of range! Expected index from interval "[0, ${this.minNotAnnotatedIdx}]". Got "${newCurrIdx}".`)
    }

    this.currIdx = newCurrIdx
    this.prevIdx = Math.max(newCurrIdx - 1, 0)
    this.nextIdx = Math.min(this.allUrls.length - 1, newCurrIdx + 1)
  }

  getCurrentProcessedUrlData() {
    if (this.processedUrlsWithAnnotationData.length <= this.currIdx) {
      return null
    }

    return this.processedUrlsWithAnnotationData[this.currIdx]
  }

  setNextUrlAsCurrent() {
    this.setCurrentIdx(this.nextIdx)
    
    return this.getCurrentUrl()
  }

  setPrevUrlAsCurrent() {
    this.setCurrentIdx(this.prevIdx)
    
    return this.getCurrentUrl()
  }

  getProcessedUrlsLength() {
    return this
      .processedUrlsWithAnnotationData
      .length
  }

  getAllUrlsLength() {
    return this
      .allUrls
      .length
  }

  getAnnotatedDataForUrl(url) {
    return this.processedUrlsWithAnnotationData
      .find(item => item.url === url)
  }
}
