import * as storage from 'shared/storage'
import * as auth from 'shared/auth'
import * as firestore from 'shared/firestore'
import * as urlService from 'shared/services/url-service'
import * as workSessionStateService from 'shared/services/work-session-state-service'
import * as userSettingsService from 'shared/services/user-settings-service'

export const saveAnnotatedUrl = async (html) => {
  const [
    annotatedElementsData,
    accessToken,
  ] = await Promise.all([
    storage.getHighlightedElements(),
    storage.getAccessToken(),
  ])
  const user = await auth.getUser(accessToken)
  const processedUrl = await userSettingsService.getUserActiveUrl(user)

  const prevProcessedUrlData = await urlService.getProcessedUrlData(processedUrl, user)

  await Promise.all([
    firestore.saveProcessedUrlData(processedUrl, {
      html,
      annotatedElementsData,
    }, user),
    firestore.saveProcessedUrl(processedUrl, {
      annotatedElementsData,
    }, user),
  ])

  let incrementMarkedImagesCount = Object.keys(annotatedElementsData).length

  if (!prevProcessedUrlData) {
    await Promise.all([
      firestore.incrementProcessedUrls(user),
      firestore.incrementMarkedImagesCountCount(user, incrementMarkedImagesCount),
    ])
  } else {
    const oldCount = prevProcessedUrlData.data && prevProcessedUrlData.data.annotatedElementsData 
      ? Object.keys(prevProcessedUrlData.data.annotatedElementsData).length 
      : 0
    await firestore.incrementMarkedImagesCountCount(user, incrementMarkedImagesCount - oldCount)
  }
  await workSessionStateService.incrementProcessedUrlsCurrIdx()

  await storage.clearHighlightedElements()
}
