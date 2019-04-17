import * as storage from 'shared/storage'
import * as firestore from 'shared/firestore'
import * as chromeService  from 'shared/services/chrome-service'
import * as auth from 'shared/auth'
import * as utils from 'shared/utils'

export const getUserUrlsForProcessing = async user => {
  const [allUrls, processedUrls] = await Promise.all([
    storage.getAllUrls(),
    firestore.getProcessedUrls(user),
  ])

  const userUrls = allUrls.filter(url => !processedUrls.some(processedUrl => utils.areUrlsSame(processedUrl, url)))

  return userUrls
}

export const getNextUserWorkSessionUrl = async user => {
  const [allUrls, processedUrls] = await Promise.all([
    storage.getAllUrls(),
    firestore.getProcessedUrls(user),
  ])

  const userUrls = allUrls.filter(url => !processedUrls.some(processedUrl => utils.areUrlsSame(processedUrl, url)))

  return userUrls.length ? userUrls[0]: ''
}


export const goToNextPage = async () => {
  const user = await auth.getUserCredentials()
  const nextUserUrl = await getNextUserWorkSessionUrl(user)

  await storage.setActiveUrl(nextUserUrl)

  if (nextUserUrl) {
    await chromeService.updateCurrentTabURL(nextUserUrl)  
  }
}
