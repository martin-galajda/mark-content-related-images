import firebase from 'firebase'
const firebaseConfig = require('../config/firebase.json')

let initialized = false

const COLLECTION_KEYS = 'processedUrlsData'

const init = () => {
  if (initialized) {
    return
  }
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig)
  initialized = true
}

const writeData = (data) => {
  firebase.firestore().collection('processedUrlsData').add({
    test: 'test',
  })
}

export const getMyAuth = async (token) => {
  init()
  var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
  const userCredential = await firebase.auth().signInAndRetrieveDataWithCredential(credential);

  console.log({ userCredential })

  return userCredential
}
