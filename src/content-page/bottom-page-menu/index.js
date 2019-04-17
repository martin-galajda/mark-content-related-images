import React from 'react'
import styled from 'styled-components'

import { MESSAGE_KEYS } from 'shared/constants'
import * as chromeService from 'shared/services/chrome-service'
import { Loader } from 'shared/components/loader'

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
      const response = await chromeService.sendMessage({
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

  render() {
    if (this.state.loading) {
      return <MenuWrapper>
        <GoToNextPageBtnWrapper>
          <Loader />
        </GoToNextPageBtnWrapper>
      </MenuWrapper>
    }


    return <MenuWrapper>
      <GoToNextPageBtnWrapper>
        <GoToNextPageBtn onClick={this.onGoToNextPage}>
          Save marked images and proceed to next page
        </GoToNextPageBtn>
      </GoToNextPageBtnWrapper>
    </MenuWrapper>
  }
}
