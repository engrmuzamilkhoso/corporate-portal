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
import FileThumbnail from './FileThumbnail'
import { useEffect, useState } from 'react'
import api from '@/utils/axios'
import { ChargeBackData, Filters } from './page'
import { ChargebackStatusColors } from '@/utils/chargebackStatusColors'
import { getRefundStatus, RefundStatusMap } from '@/utils/refundStatusMap'
import { operatorLogo } from '@/utils/operatorLogos'
import { getTransactionStatusClass, TransactionStatusMap } from '@/utils/transactionStatusClassNames'
import { Operator } from '@/utils/configurationUtils'

const ViewModal = ({
  visible,
  onClose,
  transaction,
  filters,
  operators,
  setLoader,
}: {
  visible: boolean
  onClose: () => void
  transaction: ChargeBackData
  filters: Filters
  operators: Operator[]
  setLoader: (v: boolean) => void
}) => {
  const [operatorDetails, setOperatorDetails] = useState<{
    comments: string
    evidenceFile: string
  }>({
    comments: 'These are some sample comments for the operator in initiage chargeback modal',
    evidenceFile: 'https://download.samplelib.com/png/sample-bumblebee-400x300.png',
  })
  const [merchantDetails, setMerchantDetails] = useState<{
    comments: string
    evidenceFile: string
  }>({
    comments: 'These are some sample comments for the merchant in initiage chargeback modal',
    evidenceFile: 'https://download.samplelib.com/xls/sample-simple-1.xls',
  })

  const handleOnClose = () => {
    onClose()
  }

  useEffect(() => {
    if (transaction.transactionId) {
      setLoader(true)

      api
        .post(`/corporate/chargeback/get-transaction-by-id`, { transactionId: transaction.transactionId })
        .then((transactionResponse) => {
          if (transactionResponse.status === 200 && transactionResponse.data.status === '0000') {
            const transactionData = transactionResponse.data.data

            if (transactionData) {
              setOperatorDetails({
                comments: transactionData.operatorComments,
                evidenceFile: transactionData.operatorFile,
              })
              setMerchantDetails({
                comments: transactionData.merchantComments,
                evidenceFile: transactionData.merchantFile,
              })
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching operator and merchant details: ', error)
        })
        .finally(() => {
          setLoader(false)
        })
    }
  }, [transaction.transactionId])

  return (
    visible && (
      <div className="custom-modal-backdrop">
        <div className="custom-modal">
          {/* Header */}
          <div className="custom-modal-header">
            <h5 className="modal-title fw-bold mt-1" style={{ fontSize: '0.85rem' }}>
              View Chargeback
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
                    {transaction.transactionDate
                      ? transaction.transactionDate.split('T')[0]
                      : '—'}
                  </small>
                </div>
                <div className="text-end">
                  <CFormLabel className="mb-1 d-block fw-bold" style={{ fontSize: '0.80rem' }}>
                    Transaction Status
                  </CFormLabel>
                  {getTransactionStatusClass(transaction.transactionStatus) ? (
                    <CBadge className={getTransactionStatusClass(transaction.transactionStatus)!.className}>
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
                    {transaction.refundDate
                      ? transaction.refundDate.split('T')[0]
                      : '—'}
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
                    <span title={`Operator ID: ${filters.operatorId}`} style={{ cursor: 'help', fontSize: '0.75rem' }}>
                      {operators.find(op => op.value === filters.operatorId)?.label ?? '—'}
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
                    {transaction.chargeBackDate
                      ? transaction.chargeBackDate.split('T')[0]
                      : '—'}
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
              <CCol
                md={6}
                style={{
                  borderRight: '1px solid #ccc', // vertical line
                  paddingRight: '20px',
                }}
              >
                <CFormLabel
                  className="d-block mb-2 fw-bold"
                  style={{ fontSize: '0.80rem', whiteSpace: 'nowrap' }}
                >
                  Operator Comments
                </CFormLabel>
                {operatorDetails.comments ? (
                  <small style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                    {operatorDetails.comments}
                  </small>
                ) : (
                  <small>&mdash;</small>
                )}

                <CFormLabel
                  className="d-block mt-3 mb-2 fw-bold"
                  style={{ fontSize: '0.80rem', whiteSpace: 'nowrap' }}
                >
                  Operator Evidence
                </CFormLabel>
                {operatorDetails.evidenceFile ? (
                  <FileThumbnail fileURL={operatorDetails.evidenceFile} disabled={false} />
                ) : (
                  <span style={{ color: 'gray', fontStyle: 'italic', fontSize: '0.80rem' }}>No file was uploaded</span>
                )}
              </CCol>

              {/* Merchant Column */}
              <CCol md={6} style={{ paddingLeft: '20px' }}>
                <CFormLabel
                  className="d-block mb-2 fw-bold"
                  style={{ fontSize: '0.80rem', whiteSpace: 'nowrap' }}
                >
                  Merchant Comments
                </CFormLabel>
                {merchantDetails.comments ? (
                  <small style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                    {merchantDetails.comments}
                  </small>
                ) : (
                  <small>&mdash;</small>
                )}

                <CFormLabel
                  className="d-block mt-3 mb-2 fw-bold"
                  style={{ fontSize: '0.80rem', whiteSpace: 'nowrap' }}
                >
                  Merchant Evidence
                </CFormLabel>
                {merchantDetails.evidenceFile ? (
                  <FileThumbnail fileURL={merchantDetails.evidenceFile} disabled={true} />
                ) : (
                  <span style={{ color: 'gray', fontStyle: 'italic', fontSize: '0.80rem' }}>No file was uploaded</span>
                )}
              </CCol>
            </CRow>
          </div>

          {/* Footer */}
          <div className="custom-modal-footer">
            <CButton type="button" onClick={handleOnClose} color="primary btnCustom">
              Close
            </CButton>
          </div>
        </div>
      </div>
    )
  )
}

export default ViewModal
