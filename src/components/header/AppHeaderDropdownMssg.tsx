import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeOpen } from '@coreui/icons'

import avatar8 from '@/public/images/avatars/8.jpg'


const AppHeaderDropdownMssg = () => {
  const itemsCount = 1
  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle caret={false}>
        <CIcon icon={cilEnvelopeOpen} size="lg" className="my-1 mx-2" />
        <CBadge className="position-absolute top-0 end-0">
          {itemsCount}
       </CBadge>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" style={{ minWidth: '24rem' }}>
        <CDropdownHeader className="bg-body-secondary text-body-secondary fw-semibold rounded-top mb-2">
          You have {itemsCount} messages
        </CDropdownHeader>
        <CDropdownItem href="#">
          <div className="d-flex">
            <CAvatar className="flex-shrink-0 my-3 me-3" src={avatar8.src} status="success" />
            <div className="message text-wrap">
              <div className="d-flex justify-content-between text-body-secondary small mt-1">
                <div>Jessica Williams</div>
                <div>Just now</div>
              </div>
              <div className="fw-semibold">
                <span className="text-danger">!</span> Urgent: System Maintenance Tonight
              </div>
              <div className="small text-body-secondary">
                Attention team, we&#39;ll be conducting critical system maintenance tonight from 10
                PM to 2 AM. Plan accordingly...
              </div>
            </div>
          </div>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdownMssg
