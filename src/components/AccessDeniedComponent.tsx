'use client'

import { CCol, CContainer, CRow } from '@coreui/react-pro'

const AccessDeniedComponent = ({ role = "Maker" }: { role: string }) => {
  return (
    <div className="bg-body-tertiary d-flex flex-row align-items-center" style={{minHeight:'60vh'}}>
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <div className="text-center">
              <h1 className="display-3">403</h1>
              <h4 className="pt-3">Access Denied</h4>
              <p className="text-medium-emphasis">
                Sorry, you do not have permission as {role} to view this page.
              </p>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default AccessDeniedComponent
