export const normalizeURL = url => url.replace(/\?.+/g, '')

const REGEX_EXTRACT_SUBDOMAIN = /https:\/\/(.*\.)(.*)\.cz/

/**
 * Method for comparing whether 2 urls point to same website.
 * For comparison we:
 *  - normalize URL (get rid of query params)
 *  - normalize protocol to https
 *  - get rid of "whatever1" part in https://<whatever1>.host.<whatever2> because some websites do redirects from subdomains
 */
export const areUrlsSame = (url1, url2) => {
  let url1ForComparison = normalizeURL(url1)
    .replace(/www\./,'')
    .replace(/http:/, 'https:')
    .replace(/\/$/, '')
  
  // get rid of subdomains (some websites do redirects)
  const matchesUrl1 = REGEX_EXTRACT_SUBDOMAIN.exec(url1ForComparison)
  if (matchesUrl1 && matchesUrl1[1]) {
    url1ForComparison = url1ForComparison.replace(matchesUrl1[1], '')
  }

  let url2ForComparison = normalizeURL(url2)
    .replace(/www\./,'')
    .replace(/http:/, 'https:')
    .replace(/\/$/, '')

  // get rid of subdomains (some websites do redirects)
  const matchesUrl2 = REGEX_EXTRACT_SUBDOMAIN.exec(url2ForComparison)
  if (matchesUrl2 && matchesUrl2[1]) {
    url2ForComparison = url2ForComparison.replace(matchesUrl2[1], '')
  }

  const areSame = url1ForComparison === url2ForComparison

  return areSame
}

export const urlContainsHTTPProtocol = url => /^http(s)?/.test(url)

/**
 * Adds current window location protocol to URL if it is missing.
 * Useful for src urls in image elements which sometimes do not contain protocol.
 */
export const addProtocolToImgSrcIfMissing = ({ currentLocationProtocol, url }) => {
  if (urlContainsHTTPProtocol(url)) {
    return url
  }

  return `${currentLocationProtocol}${url}`
}

