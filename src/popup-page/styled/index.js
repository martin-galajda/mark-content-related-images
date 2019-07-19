import styled from 'styled-components'

export const MenuButton = styled.button`
  height: 50px;
  width: 100%;
  outline: none;
  display: block;

  background: none;
  cursor: pointer;
  color: #111;

  border-bottom: 1px solid rgb(216,216,216);
  border-left: 1px solid rgb(216,216,216);
  border-right: 1px solid rgb(216,216,216);
  border-bottom: 1px solid rgb(216,216,216);
  
  align-self: center;
  width: 88%;

  ${props => props.isFirst ? 'border-top: 1px solid rgb(216,216,216);' : 'border-top: none;'}

  &:hover {
    background: #eee;
    color: #000;
  }
`

export const Menu = styled.div`
  margin-top: 10px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const ButtonsMenu = styled.div`
  margin-top: 10px;
  margin-bottom: 5px;
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const PageContainer = styled.div`
  max-height: 600px;
  min-height: 150px;
  width: 400px;

  font-family: Montserrat;

  button {
    font-family: Montserrat;

    font-variant: all-petite-caps;
    font-size: 1.15em;
  }

`

export const LoaderContainer = styled.div`
  width:  100%;
  height: 100%;
  margin: auto;
  display: flex;
  align-items: center;
  min-height: 150px;
`

export const BadgeContainer = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`

export const BadgeImg = styled.img`
  height: 50px;
  width: 50px;
  border-radius: 50%;
  margin-left: 8%;
  margin-right: 10px;
`

export const BadgeText = styled.div`
  height: 50px;
  width: auto;
  text-align: center;
  vertical-align: middle;
  line-height: 50px;
`

export const LineItem = styled.div`
  padding: 5px;
`

export const URLLineHeading = styled.div`
font-size: 14px;
padding-bottom: 5px;
color: #666;
font-family: Nunito;
`

export const URLTag = styled.a`
  color: blue;
  cursor: pointer;
`


export const CurrentUrlContainer = styled.div`
  padding: 5px;
  border: 1px solid #ddd;
  margin-top: 20px;
  border-radius: 10px;
  text-align: center;
`

export const MetadataConainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  align-self: center;
  width: 88%;
`
export const ButtonsContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const UserSettingsFormContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

export const ButtonGroup = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin: 12px;
`
