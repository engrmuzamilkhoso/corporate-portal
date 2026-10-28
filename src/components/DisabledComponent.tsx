'use client'

import { CCol, CContainer, CRow } from '@coreui/react-pro'
const DisabledComponent = () => (
  <div
    className="bg-body-tertiary d-flex flex-row align-items-center"
    style={{ minHeight: '60vh' }}
  >
    <CContainer>
      <CRow className="justify-content-center">
        <CCol md={6}>
          <div className="text-center">
            <h1 className="display-3">403</h1>
            <h4 className="pt-3">Access Disabled</h4>
            <p className="text-medium-emphasis">
              Sorry, your access to view this page is disabled.
            </p>
          </div>
        </CCol>
      </CRow>
    </CContainer>
  </div>
)

export default DisabledComponent
