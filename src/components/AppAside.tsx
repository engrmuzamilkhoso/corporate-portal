import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  CAvatar,
  CCloseButton,
  CFormSwitch,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CListGroup,
  CListGroupItem,
  CProgress,
  CSidebar,
  CSidebarHeader,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import {
  cibSkype,
  cilCalendar,
  cilHome,
  cilList,
  cilLocationPin,
  cilSettings,
  cilSpeech,
} from '@coreui/icons'

import avatar8 from '@/public/images/avatars/8.jpg'

import { useTypedSelector } from '../store'

const AppAside = () => {
  const dispatch = useDispatch()
  const asideShow = useTypedSelector((state) => state.asideShow)

  const [activeKey, setActiveKey] = useState(1)

  return (
    <CSidebar
      colorScheme="light"
      size="lg"
      overlaid
      placement="end"
      visible={asideShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', asideShow: visible })
      }}
    >
      <CSidebarHeader className="p-0 position-relative">
        <CNav className="w-100" variant="underline-border">
          <CNavItem>
            <CNavLink
              href="#"
              active={activeKey === 1}
              onClick={(e) => {
                e.preventDefault()
                setActiveKey(1)
              }}
            >
              <CIcon icon={cilList} />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              href="#"
              active={activeKey === 2}
              onClick={(e) => {
                e.preventDefault()
                setActiveKey(2)
              }}
            >
              <CIcon icon={cilSpeech} />
            </CNavLink>
          </CNavItem>
        </CNav>
        <CCloseButton
          className="position-absolute top-50 end-0 translate-middle my-0"
          onClick={() => dispatch({ type: 'set', asideShow: false })}
        />
      </CSidebarHeader>
      <CTabContent>
        <CTabPane visible={activeKey === 1}>
          <CListGroup flush>
            <CListGroupItem className="list-group-item border-start-4 border-start-secondary bg-body-secondary text-center fw-semibold text-body-secondary text-uppercase small">
              Today
            </CListGroupItem>
            <CListGroupItem href="#" className="border-start-4 border-start-warning">
              <CAvatar src={avatar8.src} size="lg" className="float-end" />
              <div>
                Meeting with <strong>Atif </strong>
              </div>
              <small className="text-body-secondary me-3">
                <CIcon icon={cilCalendar} /> 1 - 3pm
              </small>
              <small className="text-body-secondary">
                <CIcon icon={cilLocationPin} /> SIMPAISA, CA
              </small>
            </CListGroupItem>
          </CListGroup>
        </CTabPane>
        <CTabPane className="p-3" visible={activeKey === 2}>
          <div className="d-flex">
            <CAvatar className="flex-shrink-0 my-3 me-3" size="md" src={avatar8.src} status="success" />
            <div style={{ minWidth: 0 }}>
              <div className="d-flex justify-content-between text-body-secondary small">
                <div>Atif</div>
                <div>Just now</div>
              </div>
              <div className="fw-semibold text-truncate">
                <span className="text-danger">!</span> Urgent: Increment
              </div>
              <div className="small text-body-secondary mt-1">
                Attention team, we&#39;ll be conducting critical system maintenance tonight from 10
                PM to 2 AM. Plan accordingly...
              </div>
            </div>
          </div>
          <hr />


        </CTabPane>
      </CTabContent>
    </CSidebar>
  )
}

export default React.memo(AppAside)
