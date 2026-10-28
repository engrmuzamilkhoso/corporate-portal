import React, { useEffect, useState } from 'react'
import {
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react-pro'
import { cilAccountLogout, cilUser, cilSettings } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { useAuth } from '@/AuthContext'
import Link from 'next/link'
import styles from './../../styles/AppHeaderDropdown.module.css' // Import the CSS module

const AppHeaderDropdown = () => {
  const { logout } = useAuth()
  const [name, setName] = useState<string | null>(null)
  // @ts-ignore
  const [fullname, setFullname] = useState<strings | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      const userData = JSON.parse(token)
      setName(userData.firstName.charAt(0).toUpperCase())
      setFullname(`${userData.firstName} ${userData.lastName}`)
    }
  }, [])

  const handleLogout = () => {
    setIsLoggingOut(true) // Show "Logging out..." text
    setTimeout(() => {
      logout() // Execute actual logout after a delay
    }, 1000) // Delay for 1.5 seconds
  }

  return (
    <>
      <CDropdown variant="nav-item" alignment="end">
        <CDropdownToggle className="py-0" caret={false}>
          <div className="accountDropdown">{name}</div>
        </CDropdownToggle>
        <CDropdownMenu className="pt-0">
          <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold my-2">
            {fullname}
          </CDropdownHeader>
          <Link
            href="/profile"
            passHref
            style={{ textDecoration: 'none' }}
            className="dropdown-item"
          >
            <CIcon icon={cilUser} className="me-2" />
            Profile
          </Link>
          <CDropdownItem href="profile">
            <CIcon icon={cilSettings} className="me-2" />
            Settings
          </CDropdownItem>
          <CDropdownDivider />
          <CDropdownItem href="#" onClick={handleLogout}>
            <CIcon icon={cilAccountLogout} className="me-2" />
            Logout
          </CDropdownItem>
        </CDropdownMenu>
      </CDropdown>

      {/* Show "Logging out..." message when isLoggingOut is true */}
      {isLoggingOut && <div className={styles.loggingOutOverlay}>Logging out...</div>}
    </>
  )
}

export default AppHeaderDropdown
