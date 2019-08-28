import React from 'react'
import {
  MenuButton, 
  ButtonsContainer,
} from '../styled'
import PropTypes from 'prop-types'

export class AuthenticatedMenuButtons extends React.Component {
  getButtons() {
    const buttons = []

    if (this.props.isExtensionActive) {
      buttons.push(...[
        <MenuButton isFirst key="btn-1" onClick={this.props.onStopWorking}>Stop Working</MenuButton>,
        <MenuButton key="btn-3" onClick={this.props.onGoToActiveUrlInNewTab}>Go to Current Page</MenuButton>,
        <MenuButton key="btn-4" onClick={this.props.onGoToNextPageUnsaved}>Go to Next Page</MenuButton>,
        <MenuButton key="btn-5" onClick={this.props.onGoToSettingsView}>Settings</MenuButton>,
        <MenuButton key="btn-6" onClick={this.props.onSignOut}>Sign Out</MenuButton>,
      ])
    } else {
      buttons.push(...[
        <MenuButton isFirst key="btn-1" onClick={this.props.onStartWorking}>Start Working</MenuButton>,
        <MenuButton key="btn-3" onClick={this.props.onSignOut}>Sign Out</MenuButton>,
      ])
    }

    return buttons
  }

  render() {
    return (
      <ButtonsContainer>
        {this.getButtons()}
      </ButtonsContainer>
    )
  }
}

AuthenticatedMenuButtons.propTypes = {
  isExtensionActive: PropTypes.bool.isRequired,
  onStopWorking: PropTypes.func.isRequired,
  onProceedToNextPage: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  onStartWorking: PropTypes.func.isRequired,
  onGoToActiveUrlInNewTab: PropTypes.func.isRequired,
  onGoToNextPageUnsaved: PropTypes.func.isRequired,
  onGoToSettingsView: PropTypes.func.isRequired,
}
