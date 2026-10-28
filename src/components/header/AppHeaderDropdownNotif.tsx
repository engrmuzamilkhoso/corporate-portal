import React from 'react'
import {
  CBadge,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CProgress,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cilBasket,
  cilBell,
  cilChartPie,
  cilSpeedometer,
  cilUserFollow,
  cilUserUnfollow,
} from '@coreui/icons'

const AppHeaderDropdownNotif = () => {
  const itemsCount = 1
  return (

    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle caret={false}>
        <CIcon icon={cilBell} size="xl" className="" />
        <CBadge className="position-absolute notificationDropdown">
          {itemsCount}
        </CBadge>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0">
        <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold rounded-top mb-2">
          You have {itemsCount} notifications
        </CDropdownHeader>
        <CDropdownItem>
          <CIcon icon={cilUserFollow} className="me-2 text-success" /> New user registered
        </CDropdownItem>
        <CDropdownItem>
          <CIcon icon={cilUserUnfollow} className="me-2 text-danger" /> User deleted
        </CDropdownItem>
        <CDropdownItem>
          <CIcon icon={cilChartPie} className="me-2 text-info" /> Sales report is ready
        </CDropdownItem>
        <CDropdownItem>
          <CIcon icon={cilBasket} className="me-2 text-primary" /> New client
        </CDropdownItem>
        <CDropdownItem>
          <CIcon icon={cilSpeedometer} className="me-2 text-warning" /> Server overloaded
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdownNotif
