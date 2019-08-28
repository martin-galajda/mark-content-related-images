import * as firestore from 'shared/firestore'
import * as workSessionStateService from 'shared/services/work-session-state-service'

export const updateUserActiveWorkSession = async (user, newActiveWorkSessionId) => {
  const newSession = await firestore
    .updateUserActiveWorkSession(user, newActiveWorkSessionId)

  
  return newSession
}

export const getUserActiveUrl = async (user) => {
  const { currentWorkSessionState } = await workSessionStateService.getCurrentUserWorkSessionState(user)

  const currPosition = currentWorkSessionState.processedUrlsListCurrIdx
  const datasetUrl = await firestore.getDatasetUrl(user.settings.activeWorkSessionId, currPosition)

  return datasetUrl
}
