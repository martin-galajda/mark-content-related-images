import React from 'react'
import styled from 'styled-components'

const LoaderWrapper = styled.div`

  ${props => `
    height: ${60 * (props.spinnerSizeRatio || 1.0)}px;
    width: ${60 * (props.spinnerSizeRatio || 1.0)}px;

    @keyframes lds-spinner {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    @-webkit-keyframes lds-spinner {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
  `}
`

const SpinnerWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

const Spinner = styled.div`
  ${props => `
    width: ${260 * (props.spinnerSizeRatio || 1.0)}px !important;
    height: ${200 * (props.spinnerSizeRatio || 1.0)}px !important;
    -webkit-transform: translate(-${(100) * (props.spinnerSizeRatio || 1.0)}px, -${(100) * (props.spinnerSizeRatio || 1.0)}px) scale(1)
      translate(${(100) * (props.spinnerSizeRatio || 1.0)}px, ${(100) * (props.spinnerSizeRatio || 1.0)}px);
    transform: translate(-${(100) * (props.spinnerSizeRatio || 1.0)}px, -${(100) * (props.spinnerSizeRatio || 1.0)}px) scale(1) 
      translate(${(100) * (props.spinnerSizeRatio || 1.0)}px, ${(100) * (props.spinnerSizeRatio || 1.0)}px);
  `}
`

const NUMBER_OF_STAGES = 12
const StageDiv = styled.div`
  ${props => `
      left: calc(50% - ${6 * (props.spinnerSizeRatio || 1.0)}px);
      width: ${12 * (props.spinnerSizeRatio || 1.0)}px;
      height: ${24 * (props.spinnerSizeRatio || 1.0)}px;
      -webkit-transform-origin: ${6  * (props.spinnerSizeRatio || 1.0)}px ${52 * (props.spinnerSizeRatio || 1.0)}px;
      transform-origin: ${6 * (props.spinnerSizeRatio || 1.0) }px ${52 * (props.spinnerSizeRatio || 1.0)}px;

      top: ${props.top !== undefined ? props.top : 48}px
      position: absolute;
      -webkit-animation: lds-spinner linear 1s infinite;
      animation: lds-spinner linear 1s infinite;
      background: #337ab7;
      border-radius: 40%;

      -webkit-transform: rotate(${(360 / NUMBER_OF_STAGES * props.stageNumber)}deg);
      transform: rotate(${(360 / NUMBER_OF_STAGES * props.stageNumber)}deg);
      -webkit-animation-delay: -${(NUMBER_OF_STAGES - props.stageNumber - 1)/NUMBER_OF_STAGES}s;
      animation-delay: -${(NUMBER_OF_STAGES - props.stageNumber - 1)/NUMBER_OF_STAGES}s;
  `}

`


export const Loader = (props) => (<LoaderWrapper {...props}>
  <SpinnerWrapper className="lds-css">
    <Spinner className="lds-spinner" {...props}>
      <StageDiv stageNumber={0} {...props} ></StageDiv>
      <StageDiv stageNumber={1} {...props} ></StageDiv>
      <StageDiv stageNumber={2} {...props} ></StageDiv>
      <StageDiv stageNumber={3} {...props} ></StageDiv>
      <StageDiv stageNumber={4} {...props} ></StageDiv>
      <StageDiv stageNumber={5} {...props} ></StageDiv>
      <StageDiv stageNumber={6} {...props} ></StageDiv>
      <StageDiv stageNumber={7} {...props} ></StageDiv>
      <StageDiv stageNumber={8} {...props} ></StageDiv>
      <StageDiv stageNumber={9} {...props} ></StageDiv>
      <StageDiv stageNumber={10} {...props} ></StageDiv>
      <StageDiv stageNumber={11} {...props} ></StageDiv>
    </Spinner>
  </SpinnerWrapper>
</LoaderWrapper>)
