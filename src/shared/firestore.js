import firebase from 'firebase'
import { STORAGE_KEYS } from 'shared/constants'

// eslint-disable-next-line
const firebaseConfig = require('../config/firebase.json')

let initialized = false

const COLLECTION_KEYS = {
  workSessions: 'workSessions',
  processedUrls: (activeWorkSessionId) => `workSessions/${activeWorkSessionId}/processedUrls`,
  processedUrlsData: (activeWorkSessionId) => `workSessions/${activeWorkSessionId}/processedUrlsData`,
  userSettings: 'userSettings',
  datasets: 'datasets',
  datasetUrls: (datasetName) => `datasets/${datasetName}/urls`,
}


const makeDefaultUserSettings = async () => {
  init()

  const datasets = await listDatasets()
  const dataset = datasets[0]

  const workSession = await getOrCreateDatasetWorkSession(dataset.id)

  return {
    activeWorkSessionId: workSession.id,
  }
}

const makeProcessedUrlKey = processedUrl => encodeURIComponent(processedUrl)
const decodeProcessedUrlKey = encodedProcessedUrlKey => decodeURIComponent(encodedProcessedUrlKey)

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

  const userSettingsDoc = await getOrCreateUserSettings(profile)
  const userSessionDoc = await getOrCreateDatasetWorkSession(userSettingsDoc.data.activeWorkSessionId)

  const user = {
    profile,
    activeWorkSession: userSessionDoc.data,
    settings: userSettingsDoc.data,
  }

  return user
}

const getOrCreateDoc = async ({ collectionName, docName, defaultValue }) => {
  init()
  const docRef = firebase
    .firestore()
    .collection(collectionName)
    .doc(docName)

  const doc = await docRef.get()

  if (doc.exists) {
    return {
      id: doc.id,
      data: doc.data()
    }
  }

  const timestampNow = (new Date()).toISOString()
  const newDoc = await docRef
    .set({
      ...defaultValue,
      createdAt: timestampNow,
      updatedAt: timestampNow,
    })

  return {
    id: newDoc.id,
    data: newDoc.data()
  }
}

export const getOrCreateDatasetWorkSession = (datasetName) => {
  const defaultValue = {
    state: { [STORAGE_KEYS.processedUrlsListCurrIdx] : 0 },
    datasetName: datasetName,
  }

  return getOrCreateDoc({ collectionName: COLLECTION_KEYS.workSessions, docName: datasetName, defaultValue })
}
export const getOrCreateUserSettings = async (userProfile) => {
  const defaultValue = await makeDefaultUserSettings()

  return getOrCreateDoc({ collectionName: COLLECTION_KEYS.userSettings, docName: userProfile.email, defaultValue })
}

const listCollection = async (collectionName) => {
  init()

  const collection = await firebase
    .firestore()
    .collection(collectionName)
    .get()

  if (!collection.empty) {
    return collection.docs.map(workSession => ({
      id: workSession.id,
      data: workSession.data(),
    }))
  }

  return []
}

export const listWorkSessions = () => listCollection(COLLECTION_KEYS.workSessions)
export const listDatasets = () => listCollection(COLLECTION_KEYS.datasets)

export const getProcessedUrls = async (user) => {
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
    .collection(COLLECTION_KEYS.processedUrlsData(user.settings.activeWorkSessionId))
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
    .collection(COLLECTION_KEYS.processedUrls(user.settings.activeWorkSessionId))
    .doc(makeProcessedUrlKey(processedUrl))
    .set({
      url: processedUrl,
      data: processedUrlData,
    })

  return newProcessedUrlData
}

const _getProcessedUrlsData = async (user) => {
  init()

  const userActiveWorkSessionId = user.settings.activeWorkSessionId
  const userProcessedUrlsData = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.processedUrlsData(userActiveWorkSessionId))
    .get()

  if (userProcessedUrlsData.empty) {
    return []
  }

  return userProcessedUrlsData.docs
}

const _getProcessedUrls = async (user) => {
  init()

  const userActiveWorkSessionId = user.settings.activeWorkSessionId
  const userProcessedUrls = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.processedUrls(userActiveWorkSessionId))
    .get()

  if (userProcessedUrls.empty) {
    return []
  }

  return userProcessedUrls.docs
}

export const getAllUrls = async (datasetName) => {
  init()

  const allUrls = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.datasetUrls(datasetName))
    .get()

  let result = []
  if (!allUrls.empty) {
    result = allUrls.docs
  }

  const allUrlsFromFirebase = result
    .filter(doc => doc.exists)
    .map(doc => doc.data().pageUrl)

  return allUrlsFromFirebase
}

export const subscribeToWorkSessions = observer => {
  init()

  const cancelSubscription = firebase
    .firestore()
    .collection(COLLECTION_KEYS.workSessions)
    .onSnapshot({
      next: snapshot => {
        const docs = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          data: docSnapshot.data(),
        }))
      
        observer.onData(docs)

        return docs
      },
      error: err => observer.onError && observer.onError(err),
    })

  return cancelSubscription
}

const updateDatasetWorkSessionState = async (datasetName, workSessionStateUpdates) => {
  try {
    init()

    const datasetWorkSession = await firebase
      .firestore()
      .collection(COLLECTION_KEYS.workSessions)
      .doc(datasetName)
  
    await datasetWorkSession.update('state', workSessionStateUpdates)
  
    const datasetWorkSessionDoc = await datasetWorkSession.get()
  
    return datasetWorkSessionDoc.data()
  } catch (err) {
    console.error(err)
    console.error('Error updating user work session state.')
  }
}

export const setProcessedUrlsCurrIdx = async (user, newCurrIdx) => {
  return await updateDatasetWorkSessionState(user.settings.activeWorkSessionId, {
    [STORAGE_KEYS.processedUrlsListCurrIdx]: newCurrIdx,
  })
}

export const updateUserActiveWorkSession = async (user, newWorkSessionId) => {
  init()

  const userSettingsDoc = firebase
    .firestore()
    .collection(COLLECTION_KEYS.userSettings)
    .doc(user.profile.email)

  await userSettingsDoc.set({
    activeWorkSessionId: newWorkSessionId,
  }, { merge: true })


  const updatedUserSettingsDoc = await userSettingsDoc.get()

  return updatedUserSettingsDoc.data().activeWorkSessionId
}
