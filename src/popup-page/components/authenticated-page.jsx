import React from 'react'
import { BadgeContainer,
  BadgeImg,
  Menu,
  BadgeText,
  LineItem, 
  MetadataConainer,
  ButtonsMenu,
} from '../styled'
import PropTypes from 'prop-types'
import { AuthenticatedMenuButtons } from './authenticated-page-menu-buttons'
import { UserSettingsForm } from './user-settings-form'
import { POPUP_PAGE_VIEWS } from 'shared/constants'
import { UserSettingsFormContainer } from '../styled'

export class AuthenticatedPage extends React.Component {

  getView() {
    switch (this.props.currentView) {
    case POPUP_PAGE_VIEWS.settingsPage:
      return <UserSettingsForm
        activeWorkSession={this.props.user.settings.activeWorkSessionId}
        onGoBack={this.props.onGoToDefaultView}
        onUpdateUserWorkSession={this.props.onUpdateUserWorkSession}
      />
    case POPUP_PAGE_VIEWS.default:
      return <UserSettingsFormContainer> 
        <AuthenticatedMenuButtons {...this.props} /> 
      </UserSettingsFormContainer>
    }
  }

  render() {

    return (
      <Menu>
        <BadgeContainer>
          <BadgeImg src={this.props.profile.picture} />
          <BadgeText>{this.props.profile.email}</BadgeText>
        </BadgeContainer>
        <ButtonsMenu>
          {this.getView()}

          <MetadataConainer>
            <LineItem>
              Active dataset: {this.props.user.settings.activeWorkSessionId}
            </LineItem>
            <LineItem>
              Processed {this.props.navigationInfo.processedUrlsCount} URL-s out of {this.props.navigationInfo.allUrlsCount}.
            </LineItem>

          </MetadataConainer>
        </ButtonsMenu>
      </Menu>
    )
  }
}

AuthenticatedPage.propTypes = {
  isExtensionActive: PropTypes.bool.isRequired,
  currentView: PropTypes.string.isRequired,
  onStopWorking: PropTypes.func.isRequired,
  onProceedToNextPage: PropTypes.func.isRequired,
  onClearBrowserCache: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  onStartWorking: PropTypes.func.isRequired,
  onGoToActiveUrlInNewTab: PropTypes.func.isRequired,
  onGoToNextPageUnsaved: PropTypes.func.isRequired,
  onGoToDefaultView: PropTypes.func.isRequired,
  onUpdateUserWorkSession: PropTypes.func.isRequired,
  profile: PropTypes.shape({
    email: PropTypes.string.isRequired,
    picture: PropTypes.string.isRequired,
  }),
  navigationInfo: PropTypes.any,
  user: PropTypes.any,
}
