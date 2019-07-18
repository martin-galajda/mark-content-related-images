import * as storage from 'shared/storage'
import * as firestore from 'shared/firestore'
import * as chromeService  from 'shared/services/chrome-service'
import * as workSessionStateService  from 'shared/services/work-session-state-service'
import * as auth from 'shared/auth'
import * as browserCache from 'shared/cache/browser'
import { STORAGE_KEYS } from 'shared/constants'
import { UserUrlsList } from 'shared/data/user-urls-list'

/**
 * 
 * @param {object} user
 * @return {UserUrlsList}
 *    List containing state of annotated urls for current user
 */
export const getUserUrlsListForProcessing = async user => {
  const [{ currentWorkSessionState }, allUrls, processedUrlsData] = await Promise.all([
    workSessionStateService.getCurrentUserWorkSessionState(user),
    getAllUrls(),
    getProcessedUrlsByUser(user),
  ])

  const userUrlsList = new UserUrlsList(allUrls, processedUrlsData, currentWorkSessionState[STORAGE_KEYS.processedUrlsListCurrIdx])

  return userUrlsList
}

export const getProcessedUrlsByUser = async user => {
  const processedUrlsFromCache = await browserCache
    .getProcessedUrls()

  if (processedUrlsFromCache) {
    return processedUrlsFromCache
  }

  const processedUrlsFromRemote = await firestore
    .getProcessedUrls(user)

  await browserCache.setProcessedUrls(processedUrlsFromRemote)

  return processedUrlsFromRemote
}

export const getCurrentUserProcessedUrls = async () => {
  const user = await auth.getUser(await storage.getAccessToken())
  return getProcessedUrlsByUser(user)
}

/**
 * 
 * @return {UserUrlsList}
 *  List containing state of annotated urls for current user
 */
export const getCurrentUserUrlsListForProcessing = async () => {
  const user = await auth.getUser(await storage.getAccessToken())

  return getUserUrlsListForProcessing(user)
}

export const getAllUrls = async () => {
  const allUrlsInBrowserCache = await browserCache.getAllUrls()
  if (allUrlsInBrowserCache) {
    return allUrlsInBrowserCache
  }

  const user = await auth.getUser(await storage.getAccessToken())
  const dataset = user.settings.activeWorkSessionId
  const allUrls = await firestore.getAllUrls(dataset)

  await browserCache.setAllUrls(allUrls)

  return allUrls  
}

export const getCurrentUserWorkSessionUrl = async user => {
  const userUrls = await getUserUrlsListForProcessing(user)

  return userUrls.getCurrentUrl()
}

const getPrevUserWorkSessionUrl = async user => {
  const userUrls = await getUserUrlsListForProcessing(user)

  return userUrls.getPrevUrl()
}

export const goToNextPage = async () => {
  const user = await auth.getUserCredentials()
  const nextUserUrl = await getCurrentUserWorkSessionUrl(user)

  await browserCache.setActiveUrl(nextUserUrl)

  if (nextUserUrl) {
    await chromeService.updateCurrentTabURL(nextUserUrl)  
  }
}

export const goToNextPageUnsaved = async () => {
  const user = await auth.getUserCredentials()
  await workSessionStateService.incrementProcessedUrlsCurrIdx()
  const nextUserUrl = await getCurrentUserWorkSessionUrl(user)

  await browserCache.setActiveUrl(nextUserUrl)

  if (nextUserUrl) {
    await chromeService.updateCurrentTabURL(nextUserUrl)  
  }
}


export const getActiveUrl = async () => {
  const activeUrlInCache = await browserCache.getActiveUrl()
  if (activeUrlInCache) {
    return activeUrlInCache
  }

  const user = await auth.getUser(await storage.getAccessToken())
  const nextUserUrl = await getCurrentUserWorkSessionUrl(user)

  await browserCache.setActiveUrl(nextUserUrl)

  if (nextUserUrl) {
    await chromeService.updateCurrentTabURL(nextUserUrl)  
  }
}

export const goToPrevPage = async () => {
  const user = await auth.getUserCredentials()
  const prevUrl = await getPrevUserWorkSessionUrl(user)

  await browserCache.setActiveUrl(prevUrl)
  await workSessionStateService.decrementProcessedUrlsCurrIdx()

  if (prevUrl) {
    await chromeService.updateCurrentTabURL(prevUrl)  
  }
}
