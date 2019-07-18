import * as firestore from 'shared/firestore'
import * as storage from 'shared/storage'
import * as auth from 'shared/auth'
import * as urlService from 'shared/services/url-service'
import { STORAGE_KEYS } from 'shared/constants'

export const getCurrentUserWorkSessionState = async (user) => {
  const currentWorkSession = await firestore
    .getOrCreateDatasetWorkSession(user.settings.activeWorkSessionId)

  await storage.setProcessedUrlsCurrIdx(currentWorkSession.data.state[STORAGE_KEYS.processedUrlsListCurrIdx])

  return { 
    currentWorkSessionState: currentWorkSession.data.state,
    user,
  }
}

export const getCurrentWorkSessionState = async () => {
  const accessToken = await storage.getAccessToken()
  const user = await auth.getUser(accessToken)

  return getCurrentUserWorkSessionState(user)
}

export const incrementProcessedUrlsCurrIdx = async () => {
  const [{ 
    user,
    currentWorkSessionState,
  }, allUrls ] = await Promise.all([
    getCurrentWorkSessionState(),
    urlService.getAllUrls(),
  ])

  const newCurrIdx = (currentWorkSessionState.processedUrlsListCurrIdx + 1) % allUrls.length
  const newCurrentWorkSessionState = await firestore
    .setProcessedUrlsCurrIdx(user, newCurrIdx)

  await storage.setProcessedUrlsCurrIdx(newCurrIdx)

  return newCurrentWorkSessionState
}

export const decrementProcessedUrlsCurrIdx = async () => {
  const { 
    user,
    currentWorkSessionState,
  } = await getCurrentWorkSessionState()
  
  const newIdx = Math.max(currentWorkSessionState.processedUrlsListCurrIdx - 1, 0)

  const newCurrentWorkSessionState = await firestore.setProcessedUrlsCurrIdx(user, newIdx)

  await storage.setProcessedUrlsCurrIdx(newIdx)

  return newCurrentWorkSessionState
}
