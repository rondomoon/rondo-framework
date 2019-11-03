import styled, { css } from 'styled-components'
import { NavLink } from 'react-router-dom'

export const Navbar = styled.div`
  min-height: 3.25rem;
  display: flex;
  align-items: stretch;
`

export const NavbarBrand = styled.div`
  display: flex;
`

export interface NavbarMenuProps {
  isActive?: boolean
}

export const NavbarMenu = styled.div<NavbarMenuProps>`
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
`

export const NavbarStart = styled.ul`
  padding: 0;
  list-style-type: none;
  display: flex;
  justify-content: flex-start;
  margin-right: auto;
`

export const NavbarEnd = styled(NavbarStart)`
  margin-right: 0;
  margin-left: auto;
  justify-content: flex-end;
`

export interface NavbarDropdownProps {
  isRight?: boolean
}

export const NavbarDropdown = styled.div<NavbarDropdownProps>`
  display: none;
  box-shadow: 0 0 3px ${props => props.theme.grey.light};
  position: absolute;
  top: 100%;
  min-width: 100px;
  left: ${props => props.isRight ? 'inherit' : 0}
  right: ${props => props.isRight ? 0 : 'inherit'}
  text-align: ${props => props.isRight ? 'right' : 'left'}
  background-color: white;
`

export const navbarItemCss = css`
  display: flex;
  align-items: center;
  flex-grow: 0;
  flex-shrink: 0;
  padding: 0.5rem 0.75rem;
  position: relative;

  &:hover {
    background-color: ${props => props.theme.grey.lighter};
  }

  &.is-active {
    color: ${props => props.theme.colors.primary};
  }

  & img {
    max-height: 1.75rem;
  }

  &:hover > ${NavbarDropdown} {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-wrap: wrap;

    // & > * {
    //   justify-content: flex-end;
    // }
  }
`

export const NavbarRouterLink = styled(NavLink).attrs({
  activeClassName: 'is-active',
})`
  ${navbarItemCss}
`

export const NavbarItem = styled.span`
  ${navbarItemCss}
`

export interface NavbarBurgerProps {
  isActive?: boolean
}

export const NavbarBurger = styled.div<NavbarBurgerProps>`

`
