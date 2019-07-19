import '@babel/polyfill'
import React, { } from 'react'
import ReactDOM from 'react-dom'
import * as storage from 'shared/storage'
import * as browserCache from 'shared/cache/browser'
import * as urlService from 'shared/services/url-service'
import * as chromeService from 'shared/services/chrome-service'
import * as workSessionService from 'shared/services/work-session-service'
import { IDS, STORAGE_KEYS, DEFAULT_STORAGE_VALUES, MESSAGE_KEYS, POPUP_PAGE_VIEWS } from 'shared/constants'
import * as auth from 'shared/auth'
import { PageContainer, LoaderContainer } from './styled'
import { MaterialLoader } from 'shared/components/material-loader'
import { AuthenticatedPage }  from './components/authenticated-page'
import { SignInPage }  from './components/sign-in-page'
import * as userSettingsService from 'shared/services/user-settings-service'

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
    currentView: POPUP_PAGE_VIEWS.default,
  }

  async componentDidMount() {
    await Promise.all([
      this.init(),
      this.subscribeToNewWorkSessionData()
    ])
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

  subscribeToNewWorkSessionData() {
    this.unsubscribeToNewWorkSessionData = workSessionService.subscribeToWorkSessions({
      onData: workSessions => {
        this.setState({
          workSessions,
        })
      },
      onError: err => {
        console.error({ err }, 'Error occured when subscribing to new work sesion.')
      }
    })
  }

  componentWillUnmount() {
    if (this.unsubscribeToNewWorkSessionData) {
      this.unsubscribeToNewWorkSessionData()
    }
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

    await chromeService.sendMessage({
      messageKey: MESSAGE_KEYS.onClearCache,
    })
    await this.init()

    this.setState({
      loading: false,
    })
  }

  onGoToActiveUrlInNewTab = () => {
    chrome.tabs.create({ url: this.state[STORAGE_KEYS.activeUrl] })
  }

  onGoToNextPageUnsaved = async () => {
    this.setState({
      loading: true,
    })
    await urlService.goToNextPageUnsaved()
    await this.init()

    this.setState({
      loading: false,
    })
  }

  onGoToSettingsView = () => {
    this.setState({
      currentView: POPUP_PAGE_VIEWS.settingsPage,
    })
  }

  onGoToDefaultView = () => {
    this.setState({
      currentView: POPUP_PAGE_VIEWS.default,
    })
  }

  onUpdateUserWorkSession = async (newWorkSessionId) => {
    this.setState({ loading: true })

    await userSettingsService.updateUserActiveWorkSession(this.state.user, newWorkSessionId)
    await this.init()

    this.setState({
      currentView: POPUP_PAGE_VIEWS.default,
      loading: false,
    })
  }
  
  render() {
    if (this.state.loading) {
      return (
        <PageContainer>
          <LoaderContainer>
            <MaterialLoader />
          </LoaderContainer>
        </PageContainer>
      )
    }

    return (<PageContainer>
      {this.state.profile
        ? <AuthenticatedPage
          profile={this.state.profile}
          user={this.state.user}
          isExtensionActive={this.state[STORAGE_KEYS.extensionIsActive]}

          activeUrl={this.state[STORAGE_KEYS.activeUrl]}
          userUrlsForProcessing={this.state.userUrlsForProcessing}
          workSessions={this.state.workSessions}
          currentView={this.state.currentView}

          onStartWorking={this.onStartWorking}
          onStopWorking={this.onStopWorking}
          onProceedToNextPage={this.onProceedToNextPage}
          onSignOut={this.onSignOut}
          onClearBrowserCache={this.onClearBrowserCache}
          onGoToActiveUrlInNewTab={this.onGoToActiveUrlInNewTab}
          onGoToNextPageUnsaved={this.onGoToNextPageUnsaved}
          onGoToSettingsView={this.onGoToSettingsView}
          onGoToDefaultView={this.onGoToDefaultView}
          onUpdateUserWorkSession={this.onUpdateUserWorkSession}
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
