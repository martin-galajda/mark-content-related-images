import * as firestore from 'shared/firestore'
import * as storage from 'shared/storage'
import * as constants from 'shared/constants'

export const getUser = async token => {
  const userInStorage = await storage.getUserFromStorage()
  await storage.setAccessToken(token)

  if (userInStorage) {
    return userInStorage
  }

  const user = await firestore.getMyAuth(token)

  await storage.setUserInStorage(user)
  
  return user
}

const clearUserInStorage = async () => {
  await storage.setUserInStorage(null)
  await storage.setAccessToken(null)
  await storage.setIsSignedIn(false)
}

export const signIn = async () => {
  try {
    await signOut()
  }
  catch (err) {
    console.error({ err })
  }

  return await new Promise(resolve => {
    chrome.identity.getAuthToken({ 'interactive': true }, async function (token) {
      if (chrome.runtime.lastError || !token) {
        await clearUserInStorage()
        return resolve()
      }
      
      try {
        const user = await getUser(token)
        await storage.setIsSignedIn(true)
        resolve(user)
      } catch (err) {
        console.error({ err })
      }
    })
  })
}

export const getUserCredentials = async () => {
  return await new Promise(resolve => {
    try {
      chrome.identity.getAuthToken({ 'interactive': false }, async function(token) {
        if (chrome.runtime.lastError || !token) {
          await clearUserInStorage()
          return resolve()
        }

        try {
          const user = await getUser(token)
          return resolve(user)
        }
        catch (err) {
          console.error({ err })
          chrome.identity.removeCachedAuthToken({ token })
          return resolve()
        }
      })
    } catch (err) {
      console.error({ err })
      resolve()
    }
  })
}

export const signOut = async () => {
  return await new Promise((resolve) => {
    chrome.identity.getAuthToken({ 'interactive': false }, async function(token) {
      if (chrome.runtime.lastError) {
        await clearUserInStorage()
        if (token) {
          chrome.identity.removeCachedAuthToken({ token })
        }
        return resolve()
      }

      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, async function () {
          if (chrome.runtime.lastError) {
            await clearUserInStorage()
            return resolve()
          }
    
          const revokeTokenUrl = `${constants.GOOGLE_REVOKE_TOKEN_API_URL}?token=${token}`
          await window.fetch(revokeTokenUrl)
          await clearUserInStorage()
          resolve()
        })
      }
    }) 
  })
}
