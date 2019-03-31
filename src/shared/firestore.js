import firebase from 'firebase'
const firebaseConfig = require('../config/firebase.json')

let initialized = false

const COLLECTION_KEYS = {
  processedUrlsData: 'processedUrlsData',
  processedUrls: 'processedUrls',
  workSessions: 'workSessions',
}

const makeProcessedUrlKey = processedUrl => processedUrl.replace(/\//g, '_')

const init = () => {
  if (initialized) {
    return
  }

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)
  initialized = true
}

export const getMyAuth = async (token) => {
  init()
  var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
  const userCredential = await firebase
    .auth()
    .signInAndRetrieveDataWithCredential(credential)

  const profile = userCredential.additionalUserInfo.profile
  const userSession = await getWorkSession(profile)

  const user = {
    profile,
    session: userSession,
  }

  return user
}

export const getWorkSession = async (userProfile) => {
  init()
  const userSession = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.workSessions)
    .doc(userProfile.email)
    .get()

  if (userSession.exists) {
    return userSession.data()
  }

  const newUserSession = await firebase.firestore()
    .collection(COLLECTION_KEYS.workSessions)
    .doc(userProfile.email)
    .set({
      ids: [0],
      activeWorkSessionId: 0,
    })

  return newUserSession.data()
}

export const startNewWorkSession = async (user) => {
  init()
  const userSession = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.workSessions)
    .doc(user.profile.email)
    .get()

  if (!userSession.exists) {
    throw new Error('User was expected to have some work session when starting new!')
  }


  const userCurrentSessionData = userSession.data()
  const activeWorkSessionId = userCurrentSessionData.activeWorkSessionId
  const newActiveWorkSessionId = activeWorkSessionId + 1

  const newSessionData = {
    ids: userCurrentSessionData.ids.concat([newActiveWorkSessionId]),
    activeWorkSessionId: newActiveWorkSessionId,
  }

  const newUserSession = await firebase.firestore()
    .collection(COLLECTION_KEYS.workSessions)
    .doc(user.profile.email)
    .set(newSessionData)

  return newUserSession.data()
}

export const getProcessedUrls = async (user) => {
  init()
  const userProcessedUrls = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.processedUrlsData)
    .doc(user.profile.email)
    .collection(`session-${user.session.activeWorkSessionId}`)
    .get()

  if (!userProcessedUrls.exists) {
    return []
  }

  const data = userProcessedUrls.data()

  return Object.keys(data).map(urlKey => {
    return data[urlKey].url
  })
}

// export const getWorkSession = async (userProfile) => {
//   init()
//   const userSession = await firebase
//     .firestore()
//     .collection(COLLECTION_KEYS.workSessions)
//     .doc(userProfile.email)
//     .get()

//   if (userSession) {
//     return userSession
//   }

//   const newUserSession = await firebase.firestore()
//     .collection(COLLECTION_KEYS.workSessions)
//     .doc(userProfile.email)
//     .set({
//       ids: [0],
//       activeSessionId: 0,
//     })

//   return newUserSession
// }

export const saveProcessedUrlData = async (processedUrl, processedUrlData, user) => {
  init()

  const newProcessedUrlData = await firebase.firestore()
    .collection(COLLECTION_KEYS.processedUrlsData)
    .doc(user.profile.email)
    .collection(`session-${user.session.activeWorkSessionId}`)
    .doc(makeProcessedUrlKey(processedUrl))
    .set({
      url: processedUrl,
      data: processedUrlData,
    })

  return newProcessedUrlData
}
