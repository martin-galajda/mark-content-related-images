import React from 'react'
import styled from 'styled-components'

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
`

export class BottomPageMenu extends React.Component {

  render() {
    return <MenuWrapper>
      <GoToNextPageBtnWrapper>
        <GoToNextPageBtn>
          Save marked images and proceed to next page
        </GoToNextPageBtn>
      </GoToNextPageBtnWrapper>
    </MenuWrapper>
  }
}
