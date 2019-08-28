import firebase from 'firebase'

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


const init = () => {
  if (initialized) {
    return
  }

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)
  firebase.firestore().enablePersistence()
    .catch(function(err) {
      if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a a time.
        // ...
        console.error({ err, message: 'Failed firestore persistence precondition!' })
      } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
        // ...
        console.log({ err, message: 'Unimplemented firestore persistence!' })
      }
    })
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

const getDoc = async ({ collectionName, docName }) => {
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

  return null
}

const queryDoc = async ({ collectionName, where, limit }) => {
  init()
  let query = firebase
    .firestore()
    .collection(collectionName)
    .limit(limit || 10)

  if (where) {
    query = query.where(where.path, '==', where.value)
  }

  const queryRes = await query.get()

  if (!queryRes.empty) {
    const result = queryRes.docs.map(doc => ({
      id: doc.id,
      data: doc.data(),
    }))

    return result
  }

  return []
}

const getOrCreateDoc = async ({ collectionName, docName, defaultValue }) => {
  init()
  const doc = await getDoc({ collectionName, docName })

  if (doc) {
    return doc
  }

  const timestampNow = (new Date()).toISOString()
  const docRef = firebase
    .firestore()
    .collection(collectionName)
    .doc(docName)
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
    state: { processedUrlsListCurrIdx : 0 },
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

export const getDataset = datasetName => getDoc({ collectionName: COLLECTION_KEYS.datasets, docName: datasetName })

export const getDatasetUrl = async (datasetName, position) => {
  
  const results = await queryDoc({
    collectionName: COLLECTION_KEYS.datasetUrls(datasetName),
    where: {
      path: 'position',
      value: position,
    },
    limit: 1,
  })

  return results[0].data
}

export const saveProcessedUrlData = async (processedUrl, processedUrlData, user) => {
  init()
  
  const newProcessedUrlData = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.processedUrlsData(user.settings.activeWorkSessionId))
    .doc(String(processedUrl.position))
    .set({
      url: processedUrl.pageUrl,
      metadata: processedUrlData,
    })

  return newProcessedUrlData
}

export const saveProcessedUrl = async (processedUrl, processedUrlData, user) => {
  init()
  
  const newProcessedUrlData = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.processedUrls(user.settings.activeWorkSessionId))
    .doc(String(processedUrl.position))
    .set({
      url: processedUrl.pageUrl,
      data: processedUrlData,
    })

  return newProcessedUrlData
}

export const getProcessedUrl = async (datasetUrl, user) => {
  init()

  const processedUrlDataDoc = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.processedUrls(user.settings.activeWorkSessionId))
    .doc(String(datasetUrl.position))
    .get()

  if (processedUrlDataDoc.exists) {
    return {
      id: processedUrlDataDoc.id,
      data: processedUrlDataDoc.data(),
    }
  }

  return null
}

export const incrementProcessedUrls = async (user) => {
  init()
  
  const datasetWorkSessionRef = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.workSessions)
    .doc(user.settings.activeWorkSessionId)

  const datasetWorkSessionSnapshot = await datasetWorkSessionRef.get()

  if (!datasetWorkSessionSnapshot.data().processedUrlsCount) {
    await datasetWorkSessionRef.update({
      processedUrlsCount: 1,
    })
  } else {
    await datasetWorkSessionRef.update({
      processedUrlsCount: firebase.firestore.FieldValue.increment(1),
    })
  }

  return (await datasetWorkSessionRef.get()).data().processedUrlsCount
}

export const incrementMarkedImagesCountCount = async (user, newCount) => {
  init()
  
  const datasetWorkSessionRef = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.workSessions)
    .doc(user.settings.activeWorkSessionId)

  const datasetWorkSessionSnapshot = await datasetWorkSessionRef.get()

  if (!datasetWorkSessionSnapshot.data().markedImagesCount) {
    await datasetWorkSessionRef.update({
      markedImagesCount: newCount,
    })
  } else {
    await datasetWorkSessionRef.update({
      markedImagesCount: firebase.firestore.FieldValue.increment(newCount),
    })
  }

  return (await datasetWorkSessionRef.get()).data().markedImagesCount
}

export const getWorkSessionCounts = async (user) => {
  init()
  
  const datasetWorkSessionRef = await firebase
    .firestore()
    .collection(COLLECTION_KEYS.workSessions)
    .doc(user.settings.activeWorkSessionId)


  const data = (await datasetWorkSessionRef.get()).data()

  return {
    processedUrlsCount: data.processedUrlsCount || 0,
    markedImagesCount: data.markedImagesCount || 0,
  }
}

export const getNextUrlsForAnnotation = async (datasetName, { limit, startAtPosition } = { limit: 10, startAtPosition: 0 }) => {
  init()

  let query = firebase
    .firestore()
    .collection(COLLECTION_KEYS.datasetUrls(datasetName))

  if (startAtPosition) {
    query = query
      .orderBy('position')
      .startAt(startAtPosition)
      .limit(limit)
  }

  const allUrls = await query
    .get()

  let result = []
  if (!allUrls.empty) {
    result = allUrls.docs
  }

  const allUrlsFromFirebase = result
    .filter(doc => doc.exists)
    .map(doc => doc.data())

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
    processedUrlsListCurrIdx: newCurrIdx,
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
  },{ merge: true })

  const updatedUserSettingsDoc = await userSettingsDoc.get()

  return updatedUserSettingsDoc.data().activeWorkSessionId
}
