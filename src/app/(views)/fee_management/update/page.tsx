// components/RolePage.tsx

'use client'

import { CCol, CContainer, CRow } from '@coreui/react-pro'
import axios from 'axios'
import { useEffect, useState } from 'react'
import Page403 from '../../e403/page'
import MakerComponent from './Maker_Component'
import Loader from '@/components/loader'

const CheckerComponent = () => <div>Checker Role Content</div>
const DisabledComponent = () => (
  <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={6}>
          <div className="text-center">
            <h1 className="display-3">403</h1>
            <h4 className="pt-3">Privilege Disabled</h4>
            <p className="text-medium-emphasis">This page is currently disabled</p>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  </div>
)

const FeeManagementUpdate = () => {
  const [roleData, setRoleData] = useState<{ role?: string; disabled?: boolean }>({ role: 'maker' })
  const [loading, setLoading] = useState(false)

  if (loading) {
    return <Loader isLoading={true} />
  }

  if (roleData.disabled) {
    return <Page403 />
  }
  console.log(roleData)

  switch (roleData.role) {
    case 'maker':
      return <MakerComponent />
    case 'checker':
      return <CheckerComponent />
    default:
      return <div>No valid role found</div>
  }
}

export default FeeManagementUpdate
