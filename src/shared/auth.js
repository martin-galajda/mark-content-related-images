import * as firestore from 'shared/firestore'
import * as storage from 'shared/storage'

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
}

export const signIn = async () => {
  try {
    await signOut()
  }
  catch (err) {
    console.error({ err })
  }

  return new Promise(resolve => {
    chrome.identity.getAuthToken({ 'interactive': true }, async function(token) {
      if (chrome.runtime.lastError || !token) {
        await clearUserInStorage()
        return resolve()
      }
      
      try {
        const user = await getUser(token)
        resolve(user)
      } catch (err) {
        console.error({ err })
      }
    })
  })
}

export const getUserCredentials = async () => {
  return new Promise(resolve => {
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
  return new Promise((resolve) => {
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
    
          const revokeTokenUrl = `https://accounts.google.com/o/oauth2/revoke?token=${token}`
          await window.fetch(revokeTokenUrl)
          await clearUserInStorage()
          resolve()
        })
      }
    }) 
  })
}
