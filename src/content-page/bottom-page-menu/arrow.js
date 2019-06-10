import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { ReactComponent as LeftArrow } from '../../img/back.svg'
import { ReactComponent as RightArrow } from '../../img/right-arrow.svg'

const Wrapper = styled.div`
  display: flex;
  border-radius: 50%;

  margin-right: 10px;
  margin-left: 10px;

  &.arrow-wrapper svg {
    fill: white;
    width: 26px;
    height: 26px;
    margin: auto;
  
    &:hover {
      fill: cornflowerblue;
      cursor: pointer;
    }
  }
`

class Arrow extends React.Component {
  render() {

    return (
      <Wrapper className="arrow-wrapper" onClick={this.props.onClick}>
        {this.props.left ? <LeftArrow /> : <RightArrow />}
      </Wrapper>
    )
  }
}

Arrow.propTypes = {
  left: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
}

export default Arrow
