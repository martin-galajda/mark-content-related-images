import React from 'react'
import styled from 'styled-components'
import Arrow from './arrow'

import { MESSAGE_KEYS } from 'shared/constants'
import * as chromeService from 'shared/services/chrome-service'
import { Loader } from 'shared/components/loader'
import PropTypes from 'prop-types'
import { fontDefinition as robotoMediumBase64 } from 'shared/fonts/roboto-medium-base64'
import { fontDefinition as montserratMediumBase64 } from 'shared/fonts/montserrat-medium-base64'
import { Button, withStyles } from '@material-ui/core'
import { HTMLClasses } from '../constants'


const MenuWrapper = styled.div`
  @font-face {
    font-family: roboto-medium;
    src: url(data: application/x-font-ttf;charset=utf-8;base64,${robotoMediumBase64});
  }

  @font-face {
    font-family: montserrat;
    src: url(data: application/x-font-ttf;charset=utf-8;base64,${montserratMediumBase64});
  }

  font-family: montserrat;
  font-variant: all-petite-caps;
  font-size: 1.15em;

  button { 
    font-family: montserrat;
    font-variant: all-petite-caps;
    font-size: 1.15em;
    color: black;
  }

  height: 10% !important; 
  width: 100% !important;
  background: #eee;
  z-index: 99999999 !important;
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
  min-height: 80px;
`

const GoToNextPageBtnWrapper = styled.div`
  width:  100%;
  height: 100%;
  margin: auto;
  display: flex;
  align-items: center;

  ${props => `
    ${props.loading ? 'justify-content: center;' : 'justify-content: space-between;'}
  `}
`

const ButtonWithArrowsWrapper = styled.div`
  width: 40%;
  color: black;

  width: 40%;
  color: black;
  height: 100%;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
`

const MenuInfo = styled.div`
  padding-left: 15px;
  padding-right: 15px;
  color: white;
  width: 30%px;
`

const GoToNextPageBtn = withStyles({
  root: {
    background: 'linear-gradient(to right, #fff, #fff)', 
    borderRadius: 3,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    '&:hover': {
      background: 'linear-gradient(to right, aliceblue, aliceblue)',
    },
  },
  label: {
    textTransform: 'capitalize',
  },
})(Button)

const getSizeInBytes = str => new Blob([str]).size

export class BottomPageMenu extends React.Component {

  state = {
    loading: false,
  }

  onGoToNextPage = async () => {
    this.setState({
      loading: true,
    })

    this.props.allowNavigationChange()

    let html = String(document.documentElement.innerHTML)

    if (getSizeInBytes(html) > 600000) {
      // Firestore allows us to save only Strings with maximum size of 1MB
      // We dont care that much about inline styles (inside head element)
      // or script tags, so we just get rid of them in that case
      html = html.replace(/<head[^]*?<\/head>/gms, '')
      html = html.replace(/<script[^]*?<\/script>/gms, '')
      html = html.replace(/<style[^]*?<\/style>/gms, '')
      html = html.replace(/<iframe[^]*?<\/iframe>/gms, '')
    }

    if (getSizeInBytes(html) > 999000) {
      html = html.replace(/^\s+|\s+$/gms, '')
    }

    while (getSizeInBytes(html) > 999000) {
      html = html.substr(0, html.length - 100)
    }

    try {
      await chromeService.sendMessage({
        messageKey: MESSAGE_KEYS.onGoToNextPage,
        data: {
          html,
        },
      })
    } catch (err) {
      console.error({ err })
    }
  }

  onGoToNextPageWithoutSaving = async () => {
    this.setState({
      loading: true,
    })
    this.props.allowNavigationChange()

    try {
      await chromeService.sendMessage({
        messageKey: MESSAGE_KEYS.onGoToNextPageWithoutSaving,
      })
    } catch (err) {
      console.error({ err })
    }
  }


  onGoToPrevPage = async () => {
    this.setState({
      loading: true,
    })
    this.props.allowNavigationChange()

    try {
      await chromeService.sendMessage({
        messageKey: MESSAGE_KEYS.onGoToPrevPage,
      })
    } catch (err) {
      console.error({ err })
    }
  }

  render() {
    if (this.state.loading) {
      return <MenuWrapper>
        <GoToNextPageBtnWrapper loading>
          <Loader 
            top={0}
            spinnerSizeRatio={0.5}
            transformSpinner={'translate(-35px, 0px) scale(1) translate(0px, -10px)'}
          />
        </GoToNextPageBtnWrapper>
      </MenuWrapper>
    }

    return <MenuWrapper className={HTMLClasses.EXTENSION_ROOT_ELEM_CLASS}>
      <GoToNextPageBtnWrapper>
        <MenuInfo> Current page: {this.props.currentUrlsPosition} / {this.props.allUrlsCount}. </MenuInfo>

        <ButtonWithArrowsWrapper>
          {this.props.activeUrlHasPrevAnnotated ? <Arrow left onClick={this.onGoToPrevPage} />: null}

          <GoToNextPageBtn variant="contained" color="primary" fullWidth onClick={this.onGoToNextPage}>
            Save marked images and proceed to next page
          </GoToNextPageBtn>

          <Arrow onClick={this.onGoToNextPageWithoutSaving} />

        </ButtonWithArrowsWrapper>
        <MenuInfo> 
          <div>
            Images collected: {this.props.markedImagesCount}.
          </div>
          <div>
            Annotated already: {this.props.processedUrlsCount} / {this.props.allUrlsCount}.  
          </div>
        </MenuInfo>

      </GoToNextPageBtnWrapper>
    </MenuWrapper>
  }
}

BottomPageMenu.propTypes = {
  activeUrlHasNextAnnotated: PropTypes.bool.isRequired,
  activeUrlHasPrevAnnotated: PropTypes.bool.isRequired,
  currentUrlsPosition: PropTypes.number.isRequired,
  processedUrlsCount: PropTypes.number.isRequired,
  markedImagesCount: PropTypes.number.isRequired,
  allUrlsCount: PropTypes.number.isRequired,
  allowNavigationChange: PropTypes.func.isRequired,
}
