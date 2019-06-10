import * as firestore from 'shared/firestore'
import * as storage from 'shared/storage'
import * as auth from 'shared/auth'

export const getCurrentUserWorkSessionState = async (user) => {
  const currentWorkSessionState = await firestore.getUserWorkSessionState(user)

  await storage.setProcessedUrlsCurrIdx(currentWorkSessionState.processedUrlsListCurrIdx)

  return { 
    currentWorkSessionState,
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
    user,
    currentWorkSessionState,
  } = await getCurrentWorkSessionState()

  const newCurrentWorkSessionState = await firestore
    .setProcessedUrlsCurrIdx(user, currentWorkSessionState.processedUrlsListCurrIdx + 1)

  await storage.setProcessedUrlsCurrIdx(currentWorkSessionState.processedUrlsListCurrIdx + 1)

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
