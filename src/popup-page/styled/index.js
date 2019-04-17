import styled from 'styled-components'

export const MenuButton = styled.button`
  height: 50px;
  width: 100%;
  outline: none;
  display: block;

  background: none;
  cursor: pointer;
  border-color: #000;
  color: #333;

  &:hover {
    background: #eee;
  }
`

export const Menu = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  margin-left: 5px;
  margin-right: 5px;
`

export const PageContainer = styled.div`
  max-height: 200px;
  height: 200px;
  width: 260px;
`

export const BadgeContainer = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

export const BadgeImg = styled.img`
  height: 50px;
  width: 50px;
  border-radius: 50%;
  margin: auto;
`

export const BadgeText = styled.div`
  height: 50px;
  width: auto;
  margin: auto;
  text-align: center;
  vertical-align: middle;
  line-height: 50px;
`

export const LineItem = styled.div`
  padding: 5px;
`
