import * as firestore from 'shared/firestore'
import * as storage from 'shared/storage'
import * as auth from 'shared/auth'
import * as urlService from 'shared/services/url-service'

export const getCurrentUserWorkSessionState = async (user) => {
  const currentWorkSession = await firestore
    .getOrCreateDatasetWorkSession(user.settings.activeWorkSessionId)

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
  const {
    currentWorkSessionState,
    user,
  } = await getCurrentWorkSessionState()
  const allUrlsCount = await urlService.getAllDatasetUrlsCount(user.settings.activeWorkSessionId)

  const newCurrIdx = (currentWorkSessionState.processedUrlsListCurrIdx + 1) % allUrlsCount
  const newCurrentWorkSessionState = await firestore
    .setProcessedUrlsCurrIdx(user, newCurrIdx)

  return newCurrentWorkSessionState
}

export const decrementProcessedUrlsCurrIdx = async () => {
  const { 
    user,
    currentWorkSessionState,
  } = await getCurrentWorkSessionState()
  
  const newIdx = Math.max(currentWorkSessionState.processedUrlsListCurrIdx - 1, 0)

  const newCurrentWorkSessionState = await firestore.setProcessedUrlsCurrIdx(user, newIdx)

  return newCurrentWorkSessionState
}
