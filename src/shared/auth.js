import * as firestore from 'shared/firestore'

export const signIn = async () => {
  console.log('Initiaing sign out in sign in')
  await signOut()

  return new Promise(resolve => {
    console.log('Signing in - trying to get token')
    chrome.identity.getAuthToken({ 'interactive': true }, async function(token) {
      if (chrome.runtime.lastError || !token) {
        resolve()
      }
      console.log('In Chrome Identity and obtained token: ' + token);
      
      try {
        const userCredential = await firestore.getMyAuth(token)
        console.log({ userCredential })
        resolve(userCredential)
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
          resolve()
        }
        console.log('In Chrome Identity and obtained token: ' + token)

        try {
          const userCredential = await firestore.getMyAuth(token)
          console.log({ userCredential })
          resolve(userCredential)
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
          resolve()
        })
      }
    }) 
  })
}
