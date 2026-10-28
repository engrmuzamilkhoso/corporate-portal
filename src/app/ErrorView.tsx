'use client' // Error components must be Client Components

import { CCardBody, CCol, CContainer, CRow } from '@coreui/react-pro'
import { useEffect } from 'react'

export default function ErrorView() {
  // useEffect(() => {
  //   // Log the error to an error reporting service
  //   console.error(error)
  // }, [error])

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <div className="text-center">
              <h1 className="display-3">Encountered An Error</h1>
              <p className="text-medium-emphasis">
                Sorry, something went wrong.
              </p>
              <button
                // onClick={
                //   // Attempt to recover by trying to re-render the segment
                //   () => reset()
                // }
              >
                Try again
              </button>
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}
