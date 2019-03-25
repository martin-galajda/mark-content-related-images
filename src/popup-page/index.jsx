import '@babel/polyfill'
import React, { } from 'react'
import ReactDOM from 'react-dom'
import * as storage from 'shared/storage'
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
    const [stateInStorage, userCredentials] = await Promise.all([
      storage.getStateFromStorage(),
      auth.getUserCredentials(),
    ])

    console.log('Reinit')
    console.log({ userCredentials })

    this.setState({
      ...stateInStorage,
      profile: userCredentials ? userCredentials.additionalUserInfo.profile : null,
      loading: false,
    })
  }

  async loadStateFromStorage() {
    const [stateInStorage] = await Promise.all([
      storage.getStateFromStorage(),
    ])

    this.setState({
      ...stateInStorage,
      loading: false,
    })
  }
  
  async onStopWorking() {
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

  async onSignOut() {
    this.setState({
      loading: true,
    })
    await auth.signOut()
    await this.init()
  }

  async onSignIn() {
    const userCredentials = await auth.signIn()

    this.setState({
      profile: userCredentials ? userCredentials.additionalUserInfo.profile : null,
      loading: false,
    })
  }

  async onProceedToNextPage() {
    const highlightedElements = await storage.getHighlightedElements()
    const activeUrl = await storage.getActiveUrl(newURL)
    await storage.saveHighlightedElements({
      url: activeUrl,
      highlightedElements,
    })

    await storage.clearHighlightedElements()
    await storage.addProcessedUrl(activeUrl)

    const allUrlsInStorage = await storage.getAllUrls()
    var newURL = allUrlsInStorage[0]
    
    console.log({ newURL })
    chrome.tabs.query({
      active: true,
      currentWindow: true,
    }, (tabs) => {
      console.log(tabs)
      chrome.tabs.update(tabs[0].id, {
        url: newURL,
      }, (tab) => {
        console.log({ tab })
      })
    })
  }
  
  async onResetAndStartOver() {
    await storage.clearHighlightedElements()
    await storage.clearProcessedUrls()
    await storage.setExtensionIsActive(false)
  }
  
  async onStartWorking() {
    await storage.setExtensionIsActive(true)
    const allUrlsInStorage = await storage.getAllUrls()
    var newURL = allUrlsInStorage[0]

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
            onStartWorking={this.onStartWorking.bind(this)}
            onStopWorking={this.onStopWorking.bind(this)}
            onProceedToNextPage={this.onProceedToNextPage.bind(this)}
            onResetAndStartOver={this.onResetAndStartOver.bind(this)}
            onSignOut={this.onSignOut.bind(this)}
            />
        : <SignInPage
            onSignIn={this.onSignIn.bind(this)}
          />
      }
    </PageContainer>)
  }
}

ReactDOM.render(<PopupPageComponent />, document.getElementById(IDS.appRoot))
