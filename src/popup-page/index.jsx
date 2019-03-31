import '@babel/polyfill'
import React, { } from 'react'
import ReactDOM from 'react-dom'
import * as storage from 'shared/storage'
import * as firestore from 'shared/firestore'
import * as urlService from 'shared/services/url-service'
import styled from 'styled-components'
import { IDS, STORAGE_KEYS, DEFAULT_STORAGE_VALUES, MESSAGE_KEYS } from 'shared/constants'
import * as auth from 'shared/auth'
import { PageContainer } from './styled'
import { Loader } from './components/loader'
import { AuthenticatedPage }  from './components/authenticated-page'
import { SignInPage }  from './components/sign-in-page'


class PopupPageComponent extends React.Component {

  state = {
    [STORAGE_KEYS.processedUrls]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.processedUrls],
    [STORAGE_KEYS.processedUrlsData]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.processedUrlsData],
    [STORAGE_KEYS.activeUrl]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.activeUrl],
    [STORAGE_KEYS.allUrls]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.allUrls],
    [STORAGE_KEYS.extensionIsActive]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.extensionIsActive],
    [STORAGE_KEYS.highlightedElements]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.highlightedElements],
    loading: true,
    profile: null,
  }

  async componentDidMount() {
    await this.init()
  }

  async init() {
    const [stateInStorage, user] = await Promise.all([
      storage.getStateFromStorage(),
      auth.getUserCredentials(),
    ])

    console.log('Reinit')
    console.log({ user })

    this.setState({
      ...stateInStorage,
      profile: user ? user.profile : null,
      user,
      loading: false,
    })
  }

  loadStateFromStorage = async () => {
    const [stateInStorage] = await Promise.all([
      storage.getStateFromStorage(),
    ])

    this.setState({
      ...stateInStorage,
      loading: false,
    })
  }
  
  onStopWorking = async () => {
    await storage.setExtensionIsActive(false)
    await this.loadStateFromStorage()

    chrome.tabs.query({ currentWindow: true, active: true }, function (tabs){
      if (!chrome.runtime.lastError) {
        const activeTab = tabs[0]
        chrome.tabs.sendMessage(activeTab.id, {
          messageKey: MESSAGE_KEYS.onStopWorking,
        })  
      }
    })  
  }

  onSignOut = async () => {
    this.setState({
      loading: true,
      profile: null,
    })
    await auth.signOut()
    await this.init()
  }

  onSignIn = async () => {
    const user = await auth.signIn()

    console.log({ user })

    this.setState({
      profile: user ? user.profile : null,
      user,
      loading: false,
    })
  }

  onProceedToNextPage = async () => {
    await urlService.markUrlAsProcessed(this.state.user)
    await urlService.goToNextPage(this.state.user)
  }
  
  onResetAndStartOver = async () => {
    await storage.clearHighlightedElements()
    const newSessionData = await firestore.startNewWorkSession(this.state.user)

    const updatedUser = {
      ...this.state.user,
      session: newSessionData,
    }

    this.setState({
      user: updatedUser,
    })

    await storage.setUserInStorage(updatedUser)
    await storage.setExtensionIsActive(false)
  }
  
  onStartWorking = async () => {
    await storage.setExtensionIsActive(true)
    const nextUserUrls = await urlService.getUserUrlsForProcessing(this.state.user)
    var newURL = nextUserUrls[0]

    await storage.setActiveUrl(newURL)
    chrome.tabs.create({ url: newURL })
    await this.loadStateFromStorage()
  }

  
  render() {
    if (this.state.loading) {
      return (<PageContainer>
        <Loader />
      </PageContainer>)
    }

    return (<PageContainer>
      {this.state.profile
        ? <AuthenticatedPage
            profile={this.state.profile}
            isExtensionActive={this.state[STORAGE_KEYS.extensionIsActive]}
            onStartWorking={this.onStartWorking}
            onStopWorking={this.onStopWorking}
            onProceedToNextPage={this.onProceedToNextPage}
            onResetAndStartOver={this.onResetAndStartOver}
            onSignOut={this.onSignOut}
            />
        : <SignInPage
            onSignIn={this.onSignIn}
          />
      }
    </PageContainer>)
  }
}

ReactDOM.render(<PopupPageComponent />, document.getElementById(IDS.appRoot))
