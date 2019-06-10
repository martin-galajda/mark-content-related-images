import '@babel/polyfill'
import React, { } from 'react'
import ReactDOM from 'react-dom'
import * as storage from 'shared/storage'
import * as browserCache from 'shared/cache/browser'
import * as firestore from 'shared/firestore'
import * as urlService from 'shared/services/url-service'
import * as chromeService from 'shared/services/chrome-service'
import { IDS, STORAGE_KEYS, DEFAULT_STORAGE_VALUES, MESSAGE_KEYS } from 'shared/constants'
import * as auth from 'shared/auth'
import { PageContainer } from './styled'
import { Loader } from 'shared/components/loader'
import { AuthenticatedPage }  from './components/authenticated-page'
import { SignInPage }  from './components/sign-in-page'


class PopupPageComponent extends React.Component {

  state = {
    [STORAGE_KEYS.processedUrls]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.processedUrls],
    [STORAGE_KEYS.activeUrl]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.activeUrl],
    [STORAGE_KEYS.allUrls]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.allUrls],
    [STORAGE_KEYS.extensionIsActive]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.extensionIsActive],
    [STORAGE_KEYS.highlightedElements]: DEFAULT_STORAGE_VALUES[STORAGE_KEYS.highlightedElements],
    loading: true,
    profile: null,
    userUrlsForProcessing: null,
  }

  async componentDidMount() {
    await this.init()
  }

  async init() {
    const [extensionIsActive, activeUrl, user] = await Promise.all([
      storage.getExtensionIsActive(),
      storage.getActiveUrl(),
      auth.getUserCredentials(),
    ])

    let userUrlsForProcessing = null
    if (user) {
      userUrlsForProcessing = await urlService.getUserUrlsListForProcessing(user)

      await browserCache.setActiveUrl(userUrlsForProcessing.getCurrentUrl())
    }

    this.setState({
      [STORAGE_KEYS.extensionIsActive]: extensionIsActive,
      [STORAGE_KEYS.activeUrl]: activeUrl,
      profile: user ? user.profile : null,
      user,
      userUrlsForProcessing,
      loading: false,
    })
  }

  loadStateFromStorage = async () => {
    const [extensionIsActive, activeUrl] = await Promise.all([
      storage.getExtensionIsActive(),
      storage.getActiveUrl(),
    ])

    this.setState({
      [STORAGE_KEYS.activeUrl]: activeUrl,
      [STORAGE_KEYS.extensionIsActive]: extensionIsActive,
      loading: false,
    })
  }
  
  onStopWorking = async () => {
    await storage.setExtensionIsActive(false)
    await this.loadStateFromStorage()

    try {
      await chromeService.sendMessageToCurrentTab({
        messageKey: MESSAGE_KEYS.onStopWorking,
      })
    } catch (err) {
      console.error({ err })
    }
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

    this.setState({
      profile: user ? user.profile : null,
      user,
      loading: false,
    })
  }

  onProceedToNextPage = async () => {
    try {
      await chromeService.sendMessageToCurrentTab({
        messageKey: MESSAGE_KEYS.onGoToNextPageFromPopUp,
      })
    } catch (err) {
      console.error({ err })
    }
  }
  
  onResetAndStartOver = async () => {
    await storage.clearHighlightedElements()

    this.setState({
      loading: true,
    })

    try {
      const newSessionData = await firestore.startNewWorkSession(this.state.user)

      const updatedUser = {
        ...this.state.user,
        session: newSessionData,
      }
        
      await browserCache.setProcessedUrls([])
      await storage.setUserInStorage(updatedUser)
      await urlService.goToNextPage()
      await this.init()
    } catch (err) {
      this.setState({
        loading: false,
      })
    }
  }
  
  onStartWorking = async () => {
    await storage.setExtensionIsActive(true)
    const newURL = await urlService
      .getCurrentUserWorkSessionUrl(this.state.user)

    if (newURL) {
      await browserCache.setActiveUrl(newURL)
      chrome.tabs.create({ url: newURL })
      await this.loadStateFromStorage()  
    } else {
      await browserCache.setActiveUrl(null)

      this.setState({
        doneAnnotating: true,
      })  
    }
  }

  onClearBrowserCache = async () => {
    this.setState({
      loading: true,
    })
    await browserCache.invalidateAllItems()
    this.setState({
      loading: false,
    })
  }

  onGoToActiveUrlInNewTab = () => {
    chrome.tabs.create({ url: this.state[STORAGE_KEYS.activeUrl] })
  }
  
  render() {
    if (this.state.loading) {
      return (
        <PageContainer>
          <Loader />
        </PageContainer>
      )
    }

    return (<PageContainer>
      {this.state.profile
        ? <AuthenticatedPage
          profile={this.state.profile}
          isExtensionActive={this.state[STORAGE_KEYS.extensionIsActive]}

          activeUrl={this.state[STORAGE_KEYS.activeUrl]}
          session={this.state.user.session}
          userUrlsForProcessing={this.state.userUrlsForProcessing}

          onStartWorking={this.onStartWorking}
          onStopWorking={this.onStopWorking}
          onProceedToNextPage={this.onProceedToNextPage}
          onResetAndStartOver={this.onResetAndStartOver}
          onSignOut={this.onSignOut}
          onClearBrowserCache={this.onClearBrowserCache}
          onGoToActiveUrlInNewTab={this.onGoToActiveUrlInNewTab}

          cState={this.state}
        />
        : <SignInPage
          onSignIn={this.onSignIn}
          onClearBrowserCache={this.onClearBrowserCache}
        />
      }
    </PageContainer>)
  }
}

ReactDOM.render(<PopupPageComponent />, document.getElementById(IDS.appRoot))
