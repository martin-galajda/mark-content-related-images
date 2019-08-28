

import React from 'react'
import { Menu, MenuButton } from '../styled'

export class SignInPage extends React.Component {

  render() {
    const props = this.props

    return (
      <Menu>
        <MenuButton onClick={props.onSignIn}>Sign In</MenuButton>,
      </Menu>
    )
  }
}
