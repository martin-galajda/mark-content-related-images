import React from 'react'
import styled from 'styled-components'
import Arrow from './arrow'

import { MESSAGE_KEYS } from 'shared/constants'
import * as chromeService from 'shared/services/chrome-service'
import { Loader } from 'shared/components/loader'
import PropTypes from 'prop-types'

const MenuWrapper = styled.div`
  height: 10% !important; 
  width: 100% !important;
  background: #eee;
  z-index: 150000 !important;
  position: fixed;
  bottom: 0px;
  display: flex;
  align-items: center;

  box-sizing: border-box;
  background-color: #3c4146;
  padding: 10px;
  font-size: 14px;
  line-height: 1.7;
  color: white;
`

const GoToNextPageBtnWrapper = styled.div`
  width:  100%;
  height: 100%;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: center;
`
const GoToNextPageBtn = styled.button`
  border: 3px solid white;
  border-radius: 10px;
  padding: 5px;
  font-size: 16px;
  padding-left: 8px;
  padding-right: 8px;
  background: white;

  &:hover {
    background: aliceblue;
    cursor: pointer;
    border: 3px solid aliceblue;
  }
`

export class BottomPageMenu extends React.Component {

  state = {
    loading: false,
  }

  onGoToNextPage = async () => {
    this.setState({
      loading: true,
    })

    try {
      await chromeService.sendMessage({
        messageKey: MESSAGE_KEYS.onGoToNextPage,
        data: {
          html: String(document.documentElement.innerHTML),
        }
      })
    } catch (err) {
      console.error({ err })
    }

    this.setState({
      loading: false,
    })
  }

  onGoToNextPageWithoutSaving = async () => {
    this.setState({
      loading: true,
    })

    try {
      await chromeService.sendMessage({
        messageKey: MESSAGE_KEYS.onGoToNextPageWithoutSaving,
      })
    } catch (err) {
      console.error({ err })
    }

    this.setState({
      loading: false,
    })
  }


  onGoToPrevPage = async () => {
    this.setState({
      loading: true,
    })

    try {
      await chromeService.sendMessage({
        messageKey: MESSAGE_KEYS.onGoToPrevPage,
      })
    } catch (err) {
      console.error({ err })
    }

    this.setState({
      loading: false,
    })
  }

  render() {
    if (this.state.loading) {
      return <MenuWrapper>
        <GoToNextPageBtnWrapper>
          <Loader 
            top={0}
            spinnerSizeRatio={0.5}
          />
        </GoToNextPageBtnWrapper>
      </MenuWrapper>
    }


    return <MenuWrapper>
      <GoToNextPageBtnWrapper>
        {this.props.activeUrlHasPrevAnnotated ? <Arrow left onClick={this.onGoToPrevPage} />: null}
        <GoToNextPageBtn onClick={this.onGoToNextPage}>
          Save marked images and proceed to next page
        </GoToNextPageBtn>
        {this.props.activeUrlHasNextAnnotated ? <Arrow onClick={this.onGoToNextPageWithoutSaving} />: null}
      </GoToNextPageBtnWrapper>
    </MenuWrapper>
  }
}

BottomPageMenu.propTypes = {
  activeUrlHasNextAnnotated: PropTypes.bool.isRequired,
  activeUrlHasPrevAnnotated: PropTypes.bool.isRequired,
}
