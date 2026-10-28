'use client'

import { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react-pro'
import { save } from '@/utils/crudBtnTexts'
import EntryVerificationModal from './EntryVerificationModal'

const regions = [
  { value: '', label: 'Select Region' },
  { value: 'Bangladesh', label: 'Bangladesh' },
  { value: 'Pakistan', label: 'Pakistan' },
]

const currencies = [
  { value: '', label: 'Select Currency' },
  { value: 'USD', label: 'USD' },
  { value: 'BDT', label: 'BDT' },
  { value: 'PKR', label: 'PKR' },
]

const operators = [
  { value: '', label: 'Select Operator' },
  { value: 'Trust Bank', label: 'Trust Bank' },
  { value: 'City Bank', label: 'City Bank' },
  { value: 'DBBL', label: 'DBBL' },
]

const merchants = [
  { value: '', label: 'Select Merchant' },
  { value: 'Dhocal', label: 'Dhocal' },
  { value: 'Merchant A', label: 'Merchant A' },
  { value: 'Merchant B', label: 'Merchant B' },
]

const feeTypes = [
  { value: 'Percentage', label: 'Percentage' },
  { value: 'Fixed', label: 'Fixed' },
]

const RecordDealComponent = () => {
  const [validated, setValidated] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [verificationModalVisible, setVerificationModalVisible] = useState(false)

  const [dealData, setDealData] = useState({
    region: 'Bangladesh',
    fromCurrency: 'USD',
    operator: 'Trust Bank',
    merchant: 'Dhocal',
    sellingRate: '122.50',
    amount: '250000',
    processorFee: '5',
    processorFeeType: 'Percentage',
    swiftFee: '4',
    swiftFeeType: 'Fixed',
  })

  const verificationData = {
    fromCurrency: dealData.fromCurrency,
    region: dealData.region,
    operator: dealData.operator,
    merchant: dealData.merchant,
    sellingRate: dealData.sellingRate,
    marketRate: '122.32',
    merchantFee: `${dealData.processorFee} (Percentage)`,
    buyingRate: '124.76',
    processorFee: `${dealData.processorFee} (Percentage)`,
    swiftFee: `${dealData.swiftFee || '50'} (Fixed)`,
    originalAmount: `${dealData.amount} ${dealData.fromCurrency}`,
    convertedAmount: '30,580,000 BDT',
    fxMargin: '367.9 USD',
    marginPercentage: '0.147%',
  }
  const handleChange = (e: any) => {
    const { name, value } = e.target
    setDealData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const {
      region,
      fromCurrency,
      operator,
      merchant,
      sellingRate,
      amount,
      processorFee,
      swiftFee,
    } = dealData

    return (
      region &&
      fromCurrency &&
      operator &&
      merchant &&
      sellingRate &&
      amount &&
      processorFee &&
      swiftFee
    )
  }

  const handleRequestApproval = () => {
    setVerificationModalVisible(false)
    setDisabled(true)
    
    // Here you would typically make an API call for approval
    setTimeout(() => {
      console.log('Approval request sent successfully!')
      setDisabled(false)
    }, 2000)
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    setValidated(false)

    const isFormValid = validateForm()

    if (!isFormValid) {
      setValidated(true)
      return
    }

    console.log('Deal Data:', dealData)

    setDisabled(true)

    setVerificationModalVisible(true)
    setTimeout(() => {
      console.log('Deal recorded successfully!')
      setDisabled(false)
    }, 2000)
  }

  return (
    <CContainer md className="px-4">
      <CRow>
        <CCol xl={3}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h2 className="formTitle">Record Deal</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={9}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="region">Region</CFormLabel>
                    <CFormSelect
                      name="region"
                      value={dealData.region}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !dealData.region ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      {regions.map((region) => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel htmlFor="fromCurrency">From Currency</CFormLabel>
                    <CFormSelect
                      name="fromCurrency"
                      value={dealData.fromCurrency}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !dealData.fromCurrency ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      {currencies.map((currency) => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="operator">Operator</CFormLabel>
                    <CFormSelect
                      name="operator"
                      value={dealData.operator}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !dealData.operator ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      {operators.map((operator) => (
                        <option key={operator.value} value={operator.value}>
                          {operator.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel htmlFor="merchant">Merchant</CFormLabel>
                    <CFormSelect
                      name="merchant"
                      value={dealData.merchant}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !dealData.merchant ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      {merchants.map((merchant) => (
                        <option key={merchant.value} value={merchant.value}>
                          {merchant.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={6}>
                    <CFormLabel htmlFor="sellingRate">Selling Rate</CFormLabel>
                    <CFormInput
                      type="number"
                      name="sellingRate"
                      value={dealData.sellingRate}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !dealData.sellingRate ? 'is-invalid mt-2' : 'mt-2'}
                      placeholder="Enter selling rate"
                    />
                  </CCol>

                  <CCol md={6}>
                    <CFormLabel htmlFor="amount">Amount</CFormLabel>
                    <CFormInput
                      type="number"
                      name="amount"
                      value={dealData.amount}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !dealData.amount ? 'is-invalid mt-2' : 'mt-2'}
                      placeholder="Enter amount"
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-">
                  <CCol md={3}>
                    <CFormLabel htmlFor="processorFee">Processor Fee</CFormLabel>
                    <CFormInput
                      type="text"
                      name="processorFee"
                      value={dealData.processorFee}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !dealData.processorFee ? 'is-invalid mt-1' : 'mt-1'}
                      placeholder="Enter fee"
                    />
                  </CCol>

                  <CCol md={3}>
                    <CFormLabel htmlFor="processorFeeType" className="d-block">
                      &nbsp;
                    </CFormLabel>
                    <CFormSelect
                      name="processorFeeType"
                      value={dealData.processorFeeType}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className="mt-2"
                    >
                      {feeTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md={3}>
                    <CFormLabel htmlFor="swiftFee">Swift Fee</CFormLabel>
                    <CFormInput
                      type="text"
                      name="swiftFee"
                      value={dealData.swiftFee}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !dealData.swiftFee ? 'is-invalid mt-1' : 'mt-1'}
                      placeholder="$"
                    />
                  </CCol>

                  <CCol md={3}>
                    <CFormLabel htmlFor="swiftFeeType" className="d-block">
                      &nbsp;
                    </CFormLabel>
                    <CFormSelect
                      name="swiftFeeType"
                      value={dealData.swiftFeeType}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className="mt-2"
                    >
                      {feeTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="text-end">
                  <CCol>
                    <CButton
                      type="button"
                      color="primary btnCustom mt-4"
                      onClick={handleSubmit}
                      disabled={disabled}
                    >
                      {save}
                      <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <EntryVerificationModal
        visible={verificationModalVisible}
        onClose={() => setVerificationModalVisible(false)}
        verificationData={verificationData}
        onRequestApproval={handleRequestApproval}
        disabled={disabled}
      />
    </CContainer>
  )
}

export default RecordDealComponent
