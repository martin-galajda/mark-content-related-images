import * as firestore from 'shared/firestore'
import * as storage from 'shared/storage'

const getUser = async token => {
  const userInStorage = await storage.getUserFromStorage()
  if (userInStorage) {
    return userInStorage
  }

  console.log('Going to get user from Firestore.')
  const user = await firestore.getMyAuth(token)
  console.log({ user })

  await storage.setUserInStorage(user)
  return user
}

const clearUserInStorage = async () => {
  await storage.setUserInStorage(null)
}

export const signIn = async () => {
  console.log('Initiaing sign out in sign in')
  await signOut()

  return new Promise(resolve => {
    console.log('Signing in - trying to get token')
    chrome.identity.getAuthToken({ 'interactive': true }, async function(token) {
      if (chrome.runtime.lastError || !token) {
        await clearUserInStorage()
        resolve()
      }
      console.log('In Chrome Identity and obtained token: ' + token);
      
      try {
        const user = await getUser(token)
        console.log({ user })
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
          resolve()
        }
        console.log('In Chrome Identity and obtained token: ' + token)

        try {
          const user = await getUser(token)
          console.log({ user })
          resolve(user)
        }
        catch (err) {
          resolve()
        }
      })
    } catch (err) {
      resolve()
    }
  })
}

export const signOut = async () => {
  return new Promise((resolve) => {

    chrome.identity.getAuthToken({ 'interactive': false }, function(token) {
      if (chrome.runtime.lastError) {
        resolve()
      }
      if (token) {
        chrome.identity.removeCachedAuthToken({ token }, async function () {
          if (chrome.runtime.lastError) {
            resolve()
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
