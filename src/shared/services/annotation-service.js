import * as storage from 'shared/storage'
import * as auth from 'shared/auth'
import * as firestore from 'shared/firestore'
import * as urlService from 'shared/services/url-service'
import * as workSessionStateService from 'shared/services/work-session-state-service'
import * as browserCache from 'shared/cache/browser'
import * as R from 'ramda'

export const saveAnnotatedUrl = async (html) => {
  const [
    annotatedElementsData,
    accessToken,
    processedUrl,
    currentProcessedUrls,
  ] = await Promise.all([
    storage.getHighlightedElements(),
    storage.getAccessToken(),
    storage.getActiveUrl(),
    urlService.getCurrentUserProcessedUrls(),
  ])

  const user = await auth.getUser(accessToken)

  await Promise.all([
    firestore.saveProcessedUrlData(processedUrl, {
      html,
      annotatedElementsData,
    }, user),
    firestore.saveProcessedUrl(processedUrl, {
      annotatedElementsData,
    }, user),
  ])

  await workSessionStateService.incrementProcessedUrlsCurrIdx()

  const newProcessedUrlItem = {
    url: processedUrl,
    data: {
      annotatedElementsData,
    },
  }
  const newProcessedUrls = R.uniqBy(item => item.url, R.concat([newProcessedUrlItem], currentProcessedUrls))

  await browserCache.setProcessedUrls(newProcessedUrls)
  
  await storage.clearHighlightedElements()
}
