import * as storage from 'shared/storage'
import * as firestore from 'shared/firestore'
import * as chromeService  from 'shared/services/chrome-service'
import * as workSessionStateService  from 'shared/services/work-session-state-service'
import * as userSettingsService  from 'shared/services/user-settings-service'
import * as auth from 'shared/auth'

export const getAllDatasetUrlsCount = async () => {
  const user = await auth.getUser(await storage.getAccessToken())
  const datasetName = user.settings.activeWorkSessionId
  const dataset = await firestore.getDataset(datasetName)

  return dataset.data.urlsCount
}

export const goToNextPageInTab = async (tab) => {
  const user = await auth.getUserCredentials()
  const nextUserUrl = await userSettingsService.getUserActiveUrl(user)

  if (nextUserUrl) {
    await chromeService.updateTabURL(nextUserUrl.pageUrl, tab.id)  
  }
}

export const goToNextPage = async () => {
  const user = await auth.getUserCredentials()
  const nextUserUrl = await userSettingsService.getUserActiveUrl(user)

  if (nextUserUrl) {
    await chromeService.updateCurrentTabURL(nextUserUrl.pageUrl)  
  }
}

export const goToNextPageUnsaved = async () => {
  const user = await auth.getUserCredentials()
  await workSessionStateService.incrementProcessedUrlsCurrIdx()
  const nextUserUrl = await userSettingsService.getUserActiveUrl(user)

  if (nextUserUrl) {
    await chromeService.updateCurrentTabURL(nextUserUrl.pageUrl)  
  }
}

export const getActiveUrl = async () => {
  const user = await auth.getUser(await storage.getAccessToken())
  const nextUserUrl = await userSettingsService.getUserActiveUrl(user)
  return nextUserUrl
}

export const goToPrevPage = async () => {
  const user = await auth.getUserCredentials()
  const prevUrl = await getPrevUserWorkSessionUrl(user)

  await workSessionStateService.decrementProcessedUrlsCurrIdx()

  if (prevUrl) {
    await chromeService.updateCurrentTabURL(prevUrl.pageUrl)  
  }
}

export const getPrevUserWorkSessionUrl = async (user) => {
  const { currentWorkSessionState } = await workSessionStateService.getCurrentUserWorkSessionState(user)

  const currPosition = currentWorkSessionState.processedUrlsListCurrIdx
  const datasetUrl = await firestore.getDatasetUrl(user.settings.activeWorkSessionId, currPosition-1)

  return datasetUrl
}

export const hasNextUserWorkSessionUrl = async (user) => {
  const [{ currentWorkSessionState }, allUrlsCount] = await Promise.all([
    workSessionStateService.getCurrentUserWorkSessionState(user),
    getAllDatasetUrlsCount(),
  ])

  return currentWorkSessionState.processedUrlsListCurrIdx < allUrlsCount - 1
}

export const hasPrevUserWorkSessionUrl = async (user) => {
  const [{ currentWorkSessionState }] = await Promise.all([
    workSessionStateService.getCurrentUserWorkSessionState(user),
  ])

  return currentWorkSessionState.processedUrlsListCurrIdx > 0
}

export const getNavigationInfo = async user => {
  const [{ currentWorkSessionState }, allUrlsCount, workSessionCounts] = await Promise.all([
    workSessionStateService.getCurrentUserWorkSessionState(user),
    getAllDatasetUrlsCount(),
    firestore.getWorkSessionCounts(user),
  ])

  return {
    hasNext: currentWorkSessionState.processedUrlsListCurrIdx < allUrlsCount - 1,
    hasPrev: currentWorkSessionState.processedUrlsListCurrIdx > 0,
    currentPosition: currentWorkSessionState.processedUrlsListCurrIdx,
    processedUrlsCount: workSessionCounts.processedUrlsCount,
    markedImagesCount: workSessionCounts.markedImagesCount,
    allUrlsCount,
  }
}

export const getProcessedUrlData = async (activeUrl, user) => {
  const processedUrlDoc = await firestore.getProcessedUrl(activeUrl, user)
  return processedUrlDoc ? processedUrlDoc.data : null
}
