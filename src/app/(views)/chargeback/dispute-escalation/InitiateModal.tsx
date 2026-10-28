import useToastNotification from '@/hooks/toastNotification'
import { save } from '@/utils/crudBtnTexts'
import {
  CBadge,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
} from '@coreui/react-pro'
import { memo, use, useEffect, useRef, useState } from 'react'
import FileThumbnail from './FileThumbnail'
import api from '@/utils/axios'
import { ChargeBackData, Filters } from './page'
import { getTransactionStatusClass } from '@/utils/transactionStatusClassNames'
import { getRefundStatus } from '@/utils/refundStatusMap'
import { operatorLogo } from '@/utils/operatorLogos'
import { Operator } from '@/utils/configurationUtils'
import { ChargebackStatusColors } from '@/utils/chargebackStatusColors'

// what to do when data is very large
// check missing value cases for other columns than statuses, should be handled gracefully

const InitiateModal = ({
  visible,
  onClose,
  transaction,
  setLoader,
  reloadTable,
  filters,
  operators,
}: {
  visible: boolean
  onClose: () => void
  transaction: ChargeBackData
  setLoader: (v: boolean) => void
  reloadTable: () => void
  filters: Filters
  operators: Operator[]
}) => {
  const { showToast } = useToastNotification()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [validated, setValidated] = useState(false)
  const [disabled, setDisabled] = useState(false)

  const [operatorDetails, setOperatorDetails] = useState<{
    comments: string
    evidenceFile: File | null
  }>({
    comments: '',
    evidenceFile: null,
  })

  const handleComments = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e) {
      let { value } = e.target

      value = value.trimStart()

      if (value.length > 255) {
        value = value.slice(0, 255)
      }

      if (!value.trim()) {
        value = ''
      }

      setOperatorDetails((prev) => ({
        ...prev,
        comments: value,
      }))
    }
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = (Array.from(e.target.files) as File[])[0]
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', `The file ${file.name} exceeds the 2 MB size limit.`)
        return
      }

      setOperatorDetails((prev) => ({
        ...prev,
        evidenceFile: file,
      }))
    }
  }

  const handleRemoveFile = () => {
    setOperatorDetails((prev) => {
      return {
        ...prev,
        evidenceFile: null,
      }
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOnClose = () => {
    setOperatorDetails({ comments: '', evidenceFile: null })
    setValidated(false)
    onClose()
  }

  const validateData = () => {
    const { comments, evidenceFile } = operatorDetails

    return comments && evidenceFile
  }

  const handleSave = (e: any) => {
    const validData = validateData()
    setValidated(false)

    if (!validData) {
      setValidated(true)
      showToast('error', 'Please fill all required fields!')
      return
    }

    const formData = new FormData()
    formData.append('transactionId', transaction.transactionId)
    formData.append('operatorId', filters.operatorId)
    formData.append('region', filters.region.toLowerCase())
    formData.append('comments', operatorDetails.comments.trim())
    if (operatorDetails.evidenceFile) {
      const finalFileName = `operator-evidence_${Date.now()}_${operatorDetails.evidenceFile.name}`
      formData.append('filename', finalFileName)
      formData.append('file', operatorDetails.evidenceFile)
    }

    setDisabled(true)
    setLoader(true)

    api
      .post(`/corporate/chargeback/initiate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((initiateResponse) => {
        if (initiateResponse.data.status != '0000') {
          showToast('error', (initiateResponse.data.message as string).replace(/-/g, ' '))
        } else {
          showToast('success', `Chargeback initiated successfully.`, {
            onClose: () => {
              reloadTable()
              handleOnClose()
            },
          })
        }
      })
      .catch((error) => {
        console.error('There was an error in initiating this chargeback: ', error)
      })
      .finally(() => {
        setDisabled(false)
        setLoader(false)
      })
  }

  return (
    visible && (
      <div className="custom-modal-backdrop">
        <div className="custom-modal">
          {/* Header */}
          <div className="custom-modal-header">
            <h5 className="modal-title fw-bold mt-1" style={{ fontSize: '0.85rem' }}>
              Initiate Chargeback
            </h5>
            <button
              type="button"
              className="btn-close mt-1"
              aria-label="Close"
              style={{
                width: '0.75rem',
                height: '0.75rem',
                fontSize: '0.6rem',
              }}
              onClick={handleOnClose}
            />
          </div>

          {/* Body */}
          <div className="custom-modal-body">
            {/* Dates + Status Above Operator */}
            <CRow className="mb-2">
              <CCol className="d-flex justify-content-between align-items-center">
                <div>
                  <CFormLabel className="mb-1 d-block fw-bold" style={{ fontSize: '0.80rem' }}>
                    Transaction Date
                  </CFormLabel>
                  <small>
                    {transaction.transactionDate ? transaction.transactionDate.split('T')[0] : '—'}
                  </small>
                </div>
                <div className="text-end">
                  <CFormLabel className="mb-1 d-block fw-bold" style={{ fontSize: '0.80rem' }}>
                    Transaction Status
                  </CFormLabel>
                  {getTransactionStatusClass(transaction.transactionStatus) ? (
                    <CBadge
                      className={
                        getTransactionStatusClass(transaction.transactionStatus)!.className
                      }
                    >
                      {getTransactionStatusClass(transaction.transactionStatus)!.label}
                    </CBadge>
                  ) : (
                    '—'
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol className="d-flex justify-content-between align-items-center">
                <div>
                  <CFormLabel className="mb-1 d-block fw-bold" style={{ fontSize: '0.80rem' }}>
                    Refund Date
                  </CFormLabel>
                  <small>
                    {transaction.refundDate ? transaction.refundDate.split('T')[0] : '—'}
                  </small>
                </div>
                <div className="text-end">
                  <CFormLabel className="mb-1 d-block fw-bold" style={{ fontSize: '0.80rem' }}>
                    Refund Status
                  </CFormLabel>

                  {getRefundStatus(transaction.refundStatus) ? (
                    <CBadge className={getRefundStatus(transaction.refundStatus)!.className}>
                      {getRefundStatus(transaction.refundStatus)!.label}
                    </CBadge>
                  ) : (
                    '—'
                  )}
                </div>
              </CCol>
            </CRow>

            {/* Operator Section */}
            <CRow className="mt-4">
              <CFormLabel
                className="d-block fw-bold mb-2"
                style={{ fontSize: '0.80rem', whiteSpace: 'nowrap' }}
              >
                Operator
              </CFormLabel>
              <CCol>
                <div
                  className="d-flex align-items-center"
                  style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '10px 15px',
                  }}
                >
                  <img
                    src={operatorLogo(filters.operatorId)}
                    alt="Operator"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      marginRight: '12px',
                    }}
                  />
                  <div className="d-flex flex-column">
                    <small className="fw-semibold" style={{ fontSize: '1.0rem' }}>
                      {transaction.mobileNo ?? '—'}
                    </small>
                    <span
                      title={`Operator ID: ${filters.operatorId}`}
                      style={{ cursor: 'help', fontSize: '0.75rem' }}
                    >
                      {operators.find((op) => op.value === filters.operatorId)?.label ?? '—'}
                    </span>
                  </div>
                </div>
              </CCol>
            </CRow>

            {/* Chargeback Date + Status Below Operator */}
            <CRow className="my-3">
              <CCol className="d-flex justify-content-between align-items-center">
                <div>
                  <CFormLabel className="mb-1 d-block fw-bold" style={{ fontSize: '0.80rem' }}>
                    Chargeback Date
                  </CFormLabel>
                  <small>
                    {transaction.chargeBackDate ? transaction.chargeBackDate.split('T')[0] : '—'}
                  </small>
                </div>
                <div className="text-end">
                  <CFormLabel className="mb-1 d-block fw-bold" style={{ fontSize: '0.80rem' }}>
                    Chargeback Status
                  </CFormLabel>
                  {transaction.chargeBackStatus ? (
                    <CBadge className={`${ChargebackStatusColors[transaction.chargeBackStatus]}`}>
                      {transaction.chargeBackStatus}
                    </CBadge>
                  ) : (
                    '—'
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow className="mb-4">
              <CCol>
                <div
                  className="mt-2"
                  style={{
                    backgroundColor: '#e6f3ff', // light blue
                    padding: '15px',
                    borderRadius: '8px',
                  }}
                >
                  {/* Row 1: Integration ID (left) + Merchant ID (right) */}
                  <CRow className="mb-2">
                    <CCol className="text-start">
                      <CFormLabel
                        className="d-block fw-bold"
                        style={{ fontSize: '0.80rem', whiteSpace: 'nowrap' }}
                      >
                        Integration ID
                      </CFormLabel>
                      <small>{transaction.integrationId ?? '—'}</small>
                    </CCol>
                    <CCol className="text-end">
                      <CFormLabel
                        className="d-block fw-bold"
                        style={{ fontSize: '0.80rem', whiteSpace: 'nowrap' }}
                      >
                        Merchant ID
                      </CFormLabel>
                      <small>{transaction.merchantId ?? '—'}</small>
                    </CCol>
                  </CRow>

                  {/* Row 2: Amount */}
                  <CRow>
                    <CCol>
                      <CFormLabel
                        className="mb-0 me-2 d-inline fw-bold"
                        style={{ fontSize: '0.80rem', whiteSpace: 'nowrap' }}
                      >
                        Amount:
                      </CFormLabel>
                      <span className="fw-bold" style={{ color: '#0d6efd', fontSize: '1.3rem' }}>
                        PKR {transaction.amount ?? '—'}
                      </span>
                    </CCol>
                  </CRow>
                </div>
              </CCol>
            </CRow>

            <CRow className="mb-2 mt-2">
              {/* Operator Column */}
              <CCol md={12}>
                <CFormLabel
                  className="d-block mb-2 fw-bold"
                  style={{ fontSize: '0.80rem', whiteSpace: 'nowrap' }}
                >
                  Operator Comments
                </CFormLabel>
                <CFormTextarea
                  value={operatorDetails.comments}
                  onChange={handleComments}
                  rows={3}
                  placeholder="Enter operator comments..."
                  style={{
                    fontSize: '0.8rem', // keep text size consistent
                    resize: 'none', // prevent awkward resizing
                  }}
                  invalid={validated && !operatorDetails.comments}
                />
                {validated && !operatorDetails.comments && (
                  <small className="text-danger">Comments are required</small>
                )}

                <CFormLabel
                  className="d-block mt-3 mb-2 fw-bold"
                  style={{ fontSize: '0.80rem', whiteSpace: 'nowrap' }}
                >
                  Operator Evidence
                </CFormLabel>

                {operatorDetails.evidenceFile ? (
                  <FileThumbnail
                    file={operatorDetails.evidenceFile}
                    disabled={disabled}
                    removeFile={handleRemoveFile}
                  />
                ) : (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      accept=".csv,.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.bmp"
                    />
                    <CButton color="secondary" size="sm" variant='outline' onClick={handleUploadClick}>
                      <i className="bi bi-upload me-2"></i>
                      Upload File
                    </CButton>
                    {validated && !operatorDetails.evidenceFile && (
                      <small className="text-danger d-block mt-1">File upload is required</small>
                    )}
                  </>
                )}
              </CCol>
            </CRow>
          </div>

          {/* Footer */}
          <div className="custom-modal-footer">
            <CButton type="button" onClick={handleOnClose} color="primary" variant="outline" >
              Close
            </CButton>
            <CButton type="button" color="primary btnCustom" onClick={handleSave} disabled={false}>
              {save}
              <i className="bi bi-arrow-right ms-2"></i>
            </CButton>
          </div>
        </div>
      </div>
    )
  )
}

export default InitiateModal
