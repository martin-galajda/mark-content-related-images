export const normalizeURL = url => url.replace(/\?.+/g, '')

export const areUrlsSame = (url1, url2) => {
  const url1ForComparison = normalizeURL(url1)
    .replace(/www\./,'')
    .replace(/http:/, 'https:')
    .replace(/\/$/, '')
  const url2ForComparison = normalizeURL(url2)
    .replace(/www\./,'')
    .replace(/http:/, 'https:')
    .replace(/\/$/, '')
  const areSame = url1ForComparison === url2ForComparison

  return  areSame
}

export const urlContainsHTTPProtocol = url => /^http(s)?/.test(url)

export const addProtocolToImgSrcIfMissing = ({ currentLocationProtocol, url }) => {
  if (urlContainsHTTPProtocol(url)) {
    return url
  }

  return `${currentLocationProtocol}${url}`
}
