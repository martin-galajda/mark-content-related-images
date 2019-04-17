import React from 'react'
import { BadgeContainer, BadgeImg, Menu, MenuButton, BadgeText, LineItem } from '../styled'

export class AuthenticatedPage extends React.Component {
  getButtons() {
    const buttons = []

    if (this.props.isExtensionActive) {
      buttons.push(...[
        <MenuButton onClick={this.props.onStopWorking}>Stop working</MenuButton>,
        <MenuButton onClick={this.props.onProceedToNextPage}>Save URL and proceed to next page</MenuButton>,
        <MenuButton onClick={this.props.onResetAndStartOver}>Reset and start over</MenuButton>,
        <MenuButton onClick={this.props.onSignOut}>Sign Out</MenuButton>,
      ])
    } else {
      buttons.push(...[
        <MenuButton onClick={this.props.onStartWorking}>Start working</MenuButton>,
        <MenuButton onClick={this.props.onSignOut}>Sign Out</MenuButton>,
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
        <Menu>
          {this.getButtons()}
          <LineItem>
            Current URL: {props.activeUrl}
          </LineItem>
          <LineItem>
            Active work session ID: {props.session.activeWorkSessionId}
          </LineItem>
          <LineItem>
            Processed {props.processedUrls.length} URL-s out of {props.allUrls.length}.
          </LineItem>
          <LineItem>
            {JSON.stringify(props.cState, null, '\t')}
          </LineItem>
        </Menu>
      </Menu>
    )
  }
}
