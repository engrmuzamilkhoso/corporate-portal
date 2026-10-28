import headImage from '@/public/images/Simpaisa Logo-01.png'
import { cilGlobeAlt } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CBreadcrumb,
  CBreadcrumbItem,
  CButton,
  CContainer,
  CHeader,
  CHeaderNav,
  CNavItem,
  CRow,
} from '@coreui/react-pro'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { NavigationItem, selectNavItems, selectPrivileges, useTypedSelector } from './../store'
import { AppHeaderDropdown, AppHeaderDropdownNotif } from './header/'

const AppHeader = (): JSX.Element => {
  const headerRef = useRef<HTMLDivElement>(null)
  const dispatch = useDispatch()
  const router = useRouter()
  const navItems: NavigationItem[] = useTypedSelector(selectNavItems)
  const flatNavItems: NavigationItem[] = useTypedSelector(selectPrivileges)

  // State to track active parent and child items
  const [activeParentItem, setActiveParentItem] = useState<number | null>(null)
  const [activeChildItem, setActiveChildItem] = useState<number | null>(null)
  const location = usePathname()

  // State for showing/hiding the Etc header
  const [showEtcHeader, setShowEtcHeader] = useState(false)

  // State for time
  const [currentTime, setCurrentTime] = useState<string>('')
  const [timeZone, setTimeZone] = useState<string>('')

  useEffect(() => {
    const obj = localStorage.getItem('navigationHeader')
    if (obj) {
      const jsonObj = JSON.parse(obj)
      setActiveChildItem(jsonObj.activeChildItem)
      setActiveParentItem(jsonObj.activeParentItem)
    } else {
      setActiveChildItem(0)
    }
  }, [])

  // Function to update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setCurrentTime(time)
      setTimeZone(tz)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleMouseEnter = () => {
    setShowEtcHeader(true)
  }

  const handleMouseLeave = () => {
    setShowEtcHeader(false)
  }

  const handleParentClick = (index: number, hasChildren: boolean) => {
    if (hasChildren) {
      setActiveParentItem(index)
      setActiveChildItem(0) // navigate to first child
      if (navItems.at(index) && navItems.at(index)?.children.at(0)) {
        const path = navItems.at(index)?.children.at(0)?.path!
        console.log(path)
        setActiveChildItem(0)
        localStorage.setItem(
          'navigationHeader',
          JSON.stringify({ activeChildItem: 0, activeParentItem: index }),
        )
        router.push(path)
      }
    } else {
      setActiveParentItem(index === activeParentItem ? null : index) // Toggle active parent item
      setActiveChildItem(null) // Reset child item
      localStorage.setItem(
        'navigationHeader',
        JSON.stringify({ activeChildItem: null, activeParentItem: index }),
      )
    }
  }

  const handleChildClick = (index: number) => {
    setActiveChildItem(index) // Set active child item
    localStorage.setItem(
      'navigationHeader',
      JSON.stringify({ activeChildItem: index, activeParentItem }),
    )
  }

  useEffect(() => {
    try {
      const currentParentIndex = navItems.findIndex((item) => {
        const navItemFirstSegment = item.path.split('/').filter(Boolean)[0]
        const locationFirstSegment = location.split('/').filter(Boolean)[0]
        return navItemFirstSegment === locationFirstSegment
      })
      const parentIndex = currentParentIndex !== -1 ? currentParentIndex : activeParentItem
      setActiveParentItem(parentIndex)

      const currentRouteIndex = navItems[parentIndex!].children
        .filter((tab) => tab.createTab)
        .findIndex((item) => item.path == location)
      setActiveChildItem(currentRouteIndex)
      localStorage.setItem(
        'navigationHeader',
        JSON.stringify({
          activeChildItem: currentRouteIndex,
          activeParentItem: parentIndex,
        }),
      )
    } catch (error) {
      console.log(error)
    }
  }, [location])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="px-4" fluid>
        <CHeaderNav className="d-none d-md-flex py-1">
          <CNavItem>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link
                style={{ textDecoration: 'none' }}
                href="/dashboard/main"
                onClick={() => {
                  handleParentClick(0, false)
                }}
              >
                <CHeaderNav className="d-none d-md-flex ms-auto headerPathText">
                  <Image className="logoimage" src={headImage} alt="head" />
                </CHeaderNav>
              </Link>
              <i className="bi bi-chevron-right"></i>
            </div>
          </CNavItem>
        </CHeaderNav>
        <CHeaderNav className="d-none d-md-flex py-1 px-5">
          <CNavItem>
            <div className="pt-3" style={{ display: 'flex', alignItems: 'center' }}>
              <CBreadcrumb>
                {activeParentItem && navItems.at(activeParentItem) ? (
                  <CBreadcrumbItem>{navItems.at(activeParentItem!)?.name}</CBreadcrumbItem>
                ) : null}
                {navItems.at(activeParentItem!) &&
                navItems.at(activeParentItem!)?.children.at(activeChildItem!) ? (
                  <CBreadcrumbItem>
                    {navItems.at(activeParentItem!)?.children.at(activeChildItem!)?.name}
                  </CBreadcrumbItem>
                ) : null}
              </CBreadcrumb>
            </div>
          </CNavItem>
        </CHeaderNav>

        <CHeaderNav className="d-none d-md-flex ms-auto">
          <CRow className="px-5">
            <CButton
              className="date-header btn-sm no-hover"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <span>
                <CIcon icon={cilGlobeAlt} />{' '}
              </span>
              <span className="time-header">{currentTime}</span>
              {showEtcHeader && <span className="etc-header">{timeZone}</span>}
              <div className="time-zone">UTC+05:00</div> {/* Update to PKT timezone */}
            </CButton>
          </CRow>
          <AppHeaderDropdownNotif />
        </CHeaderNav>

        <CHeaderNav className="ms-auto ms-md-0">
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      <CContainer fluid className="border-bottom px-4">
        <CHeaderNav className="d-none d-md-flex py-0 gap">
          {navItems.map(({ name, path, children }, index) => {
            const isParentActive = activeParentItem === index
            return children.length > 0 ? (
              <CNavItem
                key={index}
                className={`nav-mstyle ${isParentActive ? 'navMenuText-active' : ''}`}
              >
                <Link
                  className={`nav-f navMenuText`}
                  href={navItems.at(index)?.children.at(0)?.path!}
                  onClick={() => handleParentClick(index, true)}
                  style={{ cursor: 'pointer' }}
                >
                  {name}
                </Link>
              </CNavItem>
            ) : (
              <CNavItem
                key={index}
                className={`nav-mstyle ${isParentActive ? 'navMenuText-active' : ''}`}
              >
                <Link
                  className="nav-f navMenuText"
                  href={path}
                  passHref
                  onClick={() => handleParentClick(index, false)}
                >
                  {name}
                </Link>
              </CNavItem>
            )
          })}
        </CHeaderNav>
      </CContainer>

      {activeParentItem !== null &&
        navItems[activeParentItem] != null &&
        navItems[activeParentItem].children.length > 0 && (
          <CContainer fluid className="child-nav-container gap px-4 justify-content-left">
            {navItems[activeParentItem].children
              .filter((child) => child.createTab)
              .map(({ name: subName, path: subPath }, subIndex) => {
                const isChildActive = activeChildItem === subIndex
                console.log()

                return (
                  <Link
                    className={`nav-f`}
                    href={subPath}
                    key={subIndex}
                    onClick={() => handleChildClick(subIndex)}
                    passHref
                  >
                    <div
                      className={`nav-link-style ${isChildActive ? 'nav-link-style-active' : ''}`}
                    >
                      {subName}
                    </div>
                  </Link>
                )
              })}
          </CContainer>
        )}
    </CHeader>
  )
}

export default AppHeader
