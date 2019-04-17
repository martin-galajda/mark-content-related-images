import React from 'react'
import styled from 'styled-components'

const LoaderWrapper = styled.div`
  height: 60px;
  width: 60px;
`

const SpinnerWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`

const Spinner = styled.div`
  width: 260px !important;
  height: 200px !important;
  -webkit-transform: translate(-100px, -100px) scale(1) translate(100px, 100px);
  transform: translate(-100px, -100px) scale(1) translate(100px, 100px);
`

const NUMBER_OF_STAGES = 12
const StageDiv = styled.div`
  ${props => `
    -webkit-transform: rotate(${(360 / NUMBER_OF_STAGES * props.stageNumber)}deg);
    transform: rotate(${(360 / NUMBER_OF_STAGES * props.stageNumber)}deg);
    -webkit-animation-delay: -${(NUMBER_OF_STAGES - props.stageNumber - 1)/NUMBER_OF_STAGES}s;
    animation-delay: -${(NUMBER_OF_STAGES - props.stageNumber - 1)/NUMBER_OF_STAGES}s;
  `}


  left: calc(50% - 6px);
  top: 48px;
  position: absolute;
  -webkit-animation: lds-spinner linear 1s infinite;
  animation: lds-spinner linear 1s infinite;
  background: #337ab7;
  width: 12px;
  height: 24px;
  border-radius: 40%;
  -webkit-transform-origin: 6px 52px;
  transform-origin: 6px 52px;
`


export const Loader = () => (<LoaderWrapper>
  <SpinnerWrapper className="lds-css">
    <Spinner className="lds-spinner">
      <StageDiv stageNumber={0}></StageDiv>
      <StageDiv stageNumber={1}></StageDiv>
      <StageDiv stageNumber={2}></StageDiv>
      <StageDiv stageNumber={3}></StageDiv>
      <StageDiv stageNumber={4}></StageDiv>
      <StageDiv stageNumber={5}></StageDiv>
      <StageDiv stageNumber={6}></StageDiv>
      <StageDiv stageNumber={7}></StageDiv>
      <StageDiv stageNumber={8}></StageDiv>
      <StageDiv stageNumber={9}></StageDiv>
      <StageDiv stageNumber={10}></StageDiv>
      <StageDiv stageNumber={11}></StageDiv>
    </Spinner>
  </SpinnerWrapper>
</LoaderWrapper>)
