import {
    CButton,
    CCol,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CRow,
} from '@coreui/react-pro'

const EntryVerificationModal = ({
  visible,
  onClose,
  verificationData,
  onRequestApproval,
  disabled = false,
}: any) => {
  return (
    <CModal visible={visible} alignment="center" size="lg" onClose={onClose}>
      <CModalHeader className='border-0'>
        <CModalTitle className='fw-bold'>Entry Verification</CModalTitle>
       
      </CModalHeader>
      <CModalBody>
        <CRow className="mb-4">
          <CCol md={6}>
            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">From Currency</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium text-primary small-label">
                  {verificationData?.fromCurrency || '-'}
                </span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Operator</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium text-primary small-label">{verificationData?.operator || '-'}</span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Selling Rate</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium small-label">{verificationData?.sellingRate || '-'}</span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Merchant Fee</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium text-primary small-label">
                  {verificationData?.merchantFee || '-'}
                </span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Processor Fee</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium text-primary small-label">
                  {verificationData?.processorFee || '-'}
                </span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Original Amount</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium small-label">{verificationData?.originalAmount || '-'}</span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">FX Margin</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium small-label">{verificationData?.fxMargin || '-'}</span>
              </CCol>
            </CRow>
          </CCol>

          <CCol md={6}>
            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Region</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium text-primary small-label">{verificationData?.region || '-'}</span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Merchant</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium text-primary small-label">{verificationData?.merchant || '-'}</span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Market Rate</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium small-label">{verificationData?.marketRate || '-'}</span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Buying Rate</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium small-label">{verificationData?.buyingRate || '-'}</span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Swift Fee</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium text-primary small-label">{verificationData?.swiftFee || '-'}</span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Converted Amount</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium small-label">{verificationData?.convertedAmount || '-'}</span>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol xs={5}>
                <span className="text-muted small-label">Margin (%)</span>
              </CCol>
              <CCol xs={7}>
                <span className="fw-medium small-label">{verificationData?.marginPercentage || '-'}</span>
              </CCol>
            </CRow>
          </CCol>
        </CRow>
        <CRow className="text-end">
          <CCol>
            <CButton
              type="button"
              color="primary btnCustom mt-2"
              onClick={onRequestApproval}
              disabled={disabled}
            >
              Request Approval
              <i className="bi bi-arrow-right ms-2"></i>
            </CButton>
          </CCol>
        </CRow>
      </CModalBody>
    </CModal>
  )
}

export default EntryVerificationModal
