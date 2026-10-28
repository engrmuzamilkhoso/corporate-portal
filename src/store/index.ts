import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import { useSelector, TypedUseSelectorHook } from 'react-redux'
import { createSelector } from 'reselect'

// NavigationItem Type
export type NavigationItem = {
  id: string
  code: string
  name: string
  type: string
  path: string
  title: string
  rtlTitle?: string | null
  icon?: string | null
  merchantDefault: boolean
  adminDefault: boolean
  createTab: boolean
  sortOrder: number
  active: boolean
  isSubMenu: boolean
  subMenuKey?: string | null
  children: NavigationItem[]
}

// State Type
export type State = {
  navItems: NavigationItem[]
  sidebarShow: boolean
  userAuth: any
  sidebarUnfoldable: boolean
  asideShow: boolean
  theme: string
  resetToken: string
}

// Get initial state from local storage
const getInitialNavItems = (): NavigationItem[] => {
  if (typeof window !== 'undefined') {
    const savedNavItems = localStorage.getItem('navItems')
    if (savedNavItems) {
      return JSON.parse(savedNavItems)
    }
  }
  return []
}

const getUserAuth = (): any => {
  if (typeof window !== 'undefined') {
    const savedAuthToken = localStorage.getItem('authToken')
    if (savedAuthToken) {
      return JSON.parse(savedAuthToken)
    }
  }
  return null;
}

// Initial State
const initialState: State = {
  navItems: getInitialNavItems(),
  sidebarShow: true,
  userAuth: getUserAuth(),
  sidebarUnfoldable: false,
  asideShow: false,
  theme: 'default',
  resetToken: '',
}

// Reducer function to handle state changes
type Args = { type?: string; [key: string]: any }

const changeState = (state = initialState, { type, ...rest }: Args): State => {
  switch (type) {
    case 'setNavItems':
      let navBarItems: NavigationItem[] = []
      if (typeof window !== 'undefined') {
        navBarItems = buildNestedMenu(rest.navItems)
        localStorage.setItem('navItems', JSON.stringify(navBarItems))
      }
      return { ...state, navItems: navBarItems }
    case 'setResetToken':
      return { ...state, resetToken: rest.resetToken }
    case 'setUserAuth':
      return { ...state, userAuth: rest.userAuth }
    case 'set':
      return { ...state, ...rest }
    default:
      return state
  }
}

// Function to build nested menu
export const buildNestedMenu = (items: NavigationItem[]): NavigationItem[] => {
  const menuMap = new Map()

  items.forEach((item) => {
    item.children = []
    menuMap.set(item.code, item)
  })

  const nestedMenu: NavigationItem[] = []

  items.forEach((item) => {
    if (item.isSubMenu) {
      nestedMenu.push(item)
    } else if (item.subMenuKey) {
      const parentItem = menuMap.get(item.subMenuKey)
      if (parentItem) {
        parentItem.children.push(item)
      } else {
        console.warn(`Parent item with code ${item.subMenuKey} not found for item ${item.code}`)
      }
    } else {
      nestedMenu.push(item)
    }
  })

  return nestedMenu
}

// eslint-disable-next-line no-unused-vars
// Memoized selector for navItems
export const selectNavItems = createSelector(
  [(state: State) => state.navItems],
  (navItems) => navItems
)

// Memoized selector for userAuth
export const selectUserAuth = createSelector(
  [(state: State) => state.userAuth],
  (userAuth) => userAuth
)

export const selectPrivileges = createSelector(
  [(state: AppState) => state.userAuth],  // Input selector
  (userAuth) => userAuth?.privileges || []  // Output selector that extracts privileges
)

// Configure the store
export function makeStore() {
  return configureStore({
    reducer: changeState,
  })
}

const store = makeStore()

// Types for App State, Dispatch, and Thunks
export type AppState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action<string>>

// Typed Selector Hook
export const useTypedSelector: TypedUseSelectorHook<State> = useSelector

export default store
