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
// export const Loader = () => (<LoaderWrapper>
//   <div className="lds-css">
//     <div className="lds-spinner">
//       <div></div>
//       <div></div>
//       <div></div>
//       <div></div>
//       <div></div>
//       <div></div>
//       <div></div>
//       <div></div>
//       <div></div>
//       <div></div>
//       <div></div>
//       <div></div>
//     </div>
//   </div>
// // </LoaderWrapper>)



// .lds-spinner {
//   position: relative;
//   width: 100%;
//   height: 100%;
// }
// .lds-spinner div {
//   left: 94px;
//   top: 48px;
//   position: absolute;
//   -webkit-animation: lds-spinner linear 1s infinite;
//   animation: lds-spinner linear 1s infinite;
//   background: #337ab7;
//   width: 12px;
//   height: 24px;
//   border-radius: 40%;
//   -webkit-transform-origin: 6px 52px;
//   transform-origin: 6px 52px;
// }
// .lds-spinner div:nth-child(1) {
//   -webkit-transform: rotate(0deg);
//   transform: rotate(0deg);
//   -webkit-animation-delay: -0.916666666666667s;
//   animation-delay: -0.916666666666667s;
// }
// .lds-spinner div:nth-child(2) {
//   -webkit-transform: rotate(30deg);
//   transform: rotate(30deg);
//   -webkit-animation-delay: -0.833333333333333s;
//   animation-delay: -0.833333333333333s;
// }
// .lds-spinner div:nth-child(3) {
//   -webkit-transform: rotate(60deg);
//   transform: rotate(60deg);
//   -webkit-animation-delay: -0.75s;
//   animation-delay: -0.75s;
// }
// .lds-spinner div:nth-child(4) {
//   -webkit-transform: rotate(90deg);
//   transform: rotate(90deg);
//   -webkit-animation-delay: -0.666666666666667s;
//   animation-delay: -0.666666666666667s;
// }
// .lds-spinner div:nth-child(5) {
//   -webkit-transform: rotate(120deg);
//   transform: rotate(120deg);
//   -webkit-animation-delay: -0.583333333333333s;
//   animation-delay: -0.583333333333333s;
// }
// .lds-spinner div:nth-child(6) {
//   -webkit-transform: rotate(150deg);
//   transform: rotate(150deg);
//   -webkit-animation-delay: -0.5s;
//   animation-delay: -0.5s;
// }
// .lds-spinner div:nth-child(7) {
//   -webkit-transform: rotate(180deg);
//   transform: rotate(180deg);
//   -webkit-animation-delay: -0.416666666666667s;
//   animation-delay: -0.416666666666667s;
// }
// .lds-spinner div:nth-child(8) {
//   -webkit-transform: rotate(210deg);
//   transform: rotate(210deg);
//   -webkit-animation-delay: -0.333333333333333s;
//   animation-delay: -0.333333333333333s;
// }
// .lds-spinner div:nth-child(9) {
//   -webkit-transform: rotate(240deg);
//   transform: rotate(240deg);
//   -webkit-animation-delay: -0.25s;
//   animation-delay: -0.25s;
// }
// .lds-spinner div:nth-child(10) {
//   -webkit-transform: rotate(270deg);
//   transform: rotate(270deg);
//   -webkit-animation-delay: -0.166666666666667s;
//   animation-delay: -0.166666666666667s;
// }
// .lds-spinner div:nth-child(11) {
//   -webkit-transform: rotate(300deg);
//   transform: rotate(300deg);
//   -webkit-animation-delay: -0.083333333333333s;
//   animation-delay: -0.083333333333333s;
// }
// .lds-spinner div:nth-child(12) {
//   -webkit-transform: rotate(330deg);
//   transform: rotate(330deg);
//   -webkit-animation-delay: 0s;
//   animation-delay: 0s;
// }
// .lds-spinner {
//   width: 200px !important;
//   height: 200px !important;
//   -webkit-transform: translate(-100px, -100px) scale(1) translate(100px, 100px);
//   transform: translate(-100px, -100px) scale(1) translate(100px, 100px);
// }
