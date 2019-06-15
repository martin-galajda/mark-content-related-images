import React from 'react'
import { BadgeContainer,
  BadgeImg,
  Menu,
  MenuButton, 
  BadgeText,
  LineItem, 
  MetadataConainer,
  ButtonsContainer,
  ButtonsMenu,
} from '../styled'
import PropTypes from 'prop-types'

export class AuthenticatedPage extends React.Component {
  getButtons() {
    const buttons = []

    if (this.props.isExtensionActive) {
      buttons.push(...[
        <MenuButton isFirst key="btn-1" onClick={this.props.onStopWorking}>Stop Working</MenuButton>,
        <MenuButton key="btn-2" onClick={this.props.onResetAndStartOver}>Restart with New Session</MenuButton>,
        <MenuButton key="btn-3" onClick={this.props.onClearBrowserCache}>Clear Browser Cache</MenuButton>,
        <MenuButton key="btn-4" onClick={this.props.onGoToActiveUrlInNewTab}>Go to Current Page</MenuButton>,
        <MenuButton key="btn-5" onClick={this.props.onGoToNextPageUnsaved}>Go to Next Page</MenuButton>,
        <MenuButton key="btn-6" onClick={this.props.onSignOut}>Sign Out</MenuButton>,
      ])
    } else {
      buttons.push(...[
        <MenuButton isFirst key="btn-1" onClick={this.props.onStartWorking}>Start Working</MenuButton>,
        <MenuButton key="btn-2" onClick={this.props.onClearBrowserCache}>Clear Browser Cache</MenuButton>,
        <MenuButton key="btn-3" onClick={this.props.onSignOut}>Sign Out</MenuButton>,
      ])
    }

    return buttons
  }

  render() {
    const props = this.props

    return (
      <Menu>
        <BadgeContainer>
          <BadgeImg src={props.profile.picture} />
          <BadgeText>{props.profile.email}</BadgeText>
        </BadgeContainer>
        <ButtonsMenu>
          <ButtonsContainer>
            {this.getButtons()}
          </ButtonsContainer>

          <MetadataConainer>
            <LineItem>
              Active work session ID: {props.session.activeWorkSessionId}
            </LineItem>
            <LineItem>
              Processed {props.userUrlsForProcessing.getProcessedUrlsLength()} URL-s out of {props.userUrlsForProcessing.getAllUrlsLength()}.
            </LineItem>

          </MetadataConainer>
        </ButtonsMenu>
      </Menu>
    )
  }
}

AuthenticatedPage.propTypes = {
  isExtensionActive: PropTypes.bool.isRequired,
  onStopWorking: PropTypes.func.isRequired,
  onProceedToNextPage: PropTypes.func.isRequired,
  onResetAndStartOver: PropTypes.func.isRequired,
  onClearBrowserCache: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  onStartWorking: PropTypes.func.isRequired,
  onGoToActiveUrlInNewTab: PropTypes.func.isRequired,
  onGoToNextPageUnsaved: PropTypes.func.isRequired,
}
