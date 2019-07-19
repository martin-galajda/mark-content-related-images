import * as firestore from 'shared/firestore'
import * as auth from 'shared/auth'
import * as urlService from 'shared/services/url-service'
import * as workSessionStateService from 'shared/services/work-session-state-service'
import * as storage from 'shared/storage'

export const updateUserActiveWorkSession = async (user, newActiveWorkSessionId) => {
  const newSession = await firestore.updateUserActiveWorkSession(user, newActiveWorkSessionId)

  // reload data into cache after update
  const updatedUser = await auth.getUser(await storage.getAccessToken(), { fromRemote: true })
  await Promise.all([
    urlService.getAllUrls({ fromRemote: true }),
    workSessionStateService.getCurrentUserWorkSessionState(updatedUser),
  ])
  await urlService.getProcessedUrlsByUser(updatedUser, { fromRemote: true })
  const activeUrl = await urlService.getActiveUrl({ fromRemote: true })

  return newSession
}
