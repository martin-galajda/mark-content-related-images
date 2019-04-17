import * as storage from 'shared/storage'
import * as auth from 'shared/auth'
import * as firestore from 'shared/firestore'

export const saveAnnotatedUrl = async (html) => {
  const [annotatedElementsData, accessToken, processedUrl] = await Promise.all([
    storage.getHighlightedElements(),
    storage.getAccessToken(),
    storage.getActiveUrl()
  ])

  if (!accessToken) {
    throw new Error('No access token in storage.')
  }
  const user = await auth.getUser(accessToken)

  await firestore.saveProcessedUrlData(processedUrl, {
    data: annotatedElementsData,
    html,
  }, user)
  await storage.addProcessedUrl(processedUrl)
  await storage.clearHighlightedElements()
}
