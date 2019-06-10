import firebase from 'firebase'
import { STORAGE_KEYS } from 'shared/constants'

const firebaseConfig = require('../config/firebase.json')

let initialized = false

const COLLECTION_KEYS = {
  processedUrlsData: 'processedUrlsData',
  processedUrls: 'processedUrls',
  workSessions: 'workSessions',
  workSessionState: 'workSessionState',
  allUrls: 'allUrls',
}

const DEFAULT_WORK_SESSION_STATE = {
  [STORAGE_KEYS.processedUrlsListCurrIdx]: 0,
}

const makeProcessedUrlKey = processedUrl => encodeURIComponent(processedUrl)
const decodeProcessedUrlKey = encodedProcessedUrlKey => decodeURIComponent(encodedProcessedUrlKey)

const makeSessionKey = user => `session-${user.session.activeWorkSessionId}`
const makeWorkSessionStateKey = user => `${user.profile.email}-${makeSessionKey(user)}`

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

  var credential = firebase.auth.GoogleAuthProvider.credential(null, token)
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

  const userWorkSessionDoc = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.workSessions)
    .doc(user.profile.email)

  await userWorkSessionDoc
    .set(newSessionData)

  const newUserSessionData = await userWorkSessionDoc
    .get()

  return newUserSessionData.data()
}

export const getProcessedUrls = async (user) => {
  console.log({ user })
  const processedUrlDocuments = await _getProcessedUrls(user)

  return processedUrlDocuments.map(doc => {
    return doc.data()
  })
}

export const getProcessedUrlsData = async (user) => {
  const processedUrlDocuments = await _getProcessedUrlsData(user)

  return processedUrlDocuments.map(doc => {
    return doc.data()
  })
}

export const getProcessedUrlsDataAsHashMap = async (user) => {
  const processedUrlDocuments = await _getProcessedUrlsData(user)
  
  const results = {}
  processedUrlDocuments.forEach(doc => {
    if (doc.exists) {
      results[decodeProcessedUrlKey(doc.id)] = doc.data()
    }
  })
  
  return results
}


export const saveProcessedUrlData = async (processedUrl, processedUrlData, user) => {
  init()
  
  const newProcessedUrlData = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.processedUrlsData)
    .doc(user.profile.email)
    .collection(makeSessionKey(user))
    .doc(makeProcessedUrlKey(processedUrl))
    .set({
      url: processedUrl,
      metadata: processedUrlData,
    })

  return newProcessedUrlData
}

export const saveProcessedUrl = async (processedUrl, processedUrlData, user) => {
  init()
  
  const newProcessedUrlData = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.processedUrls)
    .doc(user.profile.email)
    .collection(makeSessionKey(user))
    .doc(makeProcessedUrlKey(processedUrl))
    .set({
      url: processedUrl,
      data: processedUrlData,
    })

  return newProcessedUrlData
}

const _getProcessedUrlsData = async (user) => {
  init()

  const userProcessedUrlsData = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.processedUrlsData)
    .doc(user.profile.email)
    .collection(makeSessionKey(user))
    .get()

  if (userProcessedUrlsData.empty) {
    return []
  }

  return userProcessedUrlsData.docs
}

const _getProcessedUrls = async (user) => {
  init()

  const userProcessedUrls = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.processedUrls)
    .doc(user.profile.email)
    .collection(makeSessionKey(user))
    .get()

  if (userProcessedUrls.empty) {
    return []
  }

  return userProcessedUrls.docs
}


export const getAllUrls = async () => {
  init()

  const allUrls = await firebase
    .firestore()
    // .collection(COLLECTION_KEYS.allUrls)
    .collection('test1')
    .get()

  let result = []
  if (!allUrls.empty) {
    result = allUrls.docs
  }

  const allUrlsFromFirebase = result
    .filter(r => r.exists)
    .map(r => r.data().pageUrl)

  return allUrlsFromFirebase
}

const updateUserWorkSessionState = async (user, workSessionStateUpdates) => {
  try {
    init()

    const userWorkSessionState = await firebase
      .firestore()
      .collection(COLLECTION_KEYS.workSessionState)
      .doc(makeWorkSessionStateKey(user))
  
    await userWorkSessionState.update('processedUrlsListCurrIdx',
      workSessionStateUpdates.processedUrlsListCurrIdx)
  
    const userWorkSessionStateDoc = await userWorkSessionState.get()
  
    return userWorkSessionStateDoc.data()
  } catch (err) {
    console.error(err)
    console.error('Error updating user work session state.')
  }
}

export const setProcessedUrlsCurrIdx = async (user, newCurrIdx) => {
  return await updateUserWorkSessionState(user, {
    [STORAGE_KEYS.processedUrlsListCurrIdx]: newCurrIdx,
  })
}

export const getUserWorkSessionState = async (user) => {
  init()

  try {
    const userWorkSessionStateRef = await firebase
      .firestore()
      .collection(COLLECTION_KEYS.workSessionState)
      .doc(makeWorkSessionStateKey(user))

    const userWorkSessionState = await userWorkSessionStateRef.get()

    if (!userWorkSessionState.exists) {
      await userWorkSessionStateRef.set(DEFAULT_WORK_SESSION_STATE)

      const docRef = await userWorkSessionStateRef
        .get()

      return docRef.data()
    }

    const docData = await userWorkSessionState.data()

    return docData
  } catch (err) {
    console.error({ err }, 'Error getting user work session state.')
    throw new Error('Error getting user work session state.')
  }
}
