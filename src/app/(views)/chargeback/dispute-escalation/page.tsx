'use client'

import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import { api } from '@/utils/axios'
import { CommonUtil } from '@/utils/common'
import { cilSearch, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCardBody,
  CCol,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CImage,
  CInputGroup,
  CMultiSelect,
  CRow,
  CSmartTable,
} from '@coreui/react-pro'
import {
  configRegions,
  Operator,
} from '@/utils/configurationUtils'
import React, { useEffect, useState } from 'react'
import { useFetchMerchants } from '@/hooks/useFetchMerchants'
import { operatorLogo } from '@/utils/operatorLogos'
import InitiateModal from './InitiateModal'
import ViewModal from './ViewModal'
import { useFetchOperators } from '@/hooks/operator-config/useFetchOperators'
import { getRefundStatus } from '@/utils/refundStatusMap'
import { ChargebackStatusColors } from '@/utils/chargebackStatusColors'
import { getTransactionStatusClass } from '@/utils/transactionStatusClassNames'
import chargebackPK from '@/assets/chargeback-icons/chargebackPK.svg'
import chargebackBDT from '@/assets/chargeback-icons/chargebackBDT.svg'
import chargebackNPL from '@/assets/chargeback-icons/chargebackNPL.svg'

export interface Filters {
  search: string
  region: string
  operatorId: string
  merchantId: string
  isDateTransaction: boolean,
  date: string
  today: boolean
}

export interface ChargeBackData {
  transactionDate: string,
  transactionStatus: string,
  refundDate: string,
  refundStatus: string,
  mobileNo: string,
  operatorId: string,
  chargeBackDate: string,
  chargeBackStatus: string,
  amount: number,
  integrationId: number,
  merchantId: number,
  transactionId: string
  operatorComments: string,
  operatorFile: string,
  merchantComments: string,
  merchantFile: string,
}

const emptyChargeBack: ChargeBackData = {
  transactionDate: '',
  transactionStatus: '',
  refundDate: '',
  refundStatus: '',
  operatorId: '',
  mobileNo: '',
  chargeBackDate: '',
  chargeBackStatus: '',
  amount: 0,
  integrationId: 0,
  merchantId: 0,
  transactionId: '',
  operatorComments: '',
  operatorFile: '',
  merchantComments: '',
  merchantFile: '',
}

// To-dos:
// validation for transaction IDs [done]
// maker-checker needed?? [not for now]
// PDF/CSV download neeed?? [not for now]

const DisputeEscalation = () => {
  const { showToast } = useToastNotification()

  const [validated, setValidated] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    region: '',
    operatorId: '',
    merchantId: '', // optional
    isDateTransaction: true,
    date: '',
    today: false,
  })
  const [loader, setLoader] = useState(false)
  const [chargebackList, setChargebackList] = useState<ChargeBackData[]>([])
  const [showInitiateModal, setShowInitiateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [operators, setOperators] = useState<Operator[]>([])
  const [merchants, setMerchants] = useState<{ value: string; label: string }[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<ChargeBackData>(emptyChargeBack)
  const [viewTransaction, setViewTransaction] = useState<ChargeBackData>(emptyChargeBack)
  const [chargeBackIcon, setChargeBackIcon] = useState('')

  const columns = [
    { key: 'transactionId', label: 'Transaction ID', _style: { width: '7%' } },
    { key: 'merchantId', label: 'Merchant ID', _style: { width: '7%' } },
    { key: 'amount', label: 'Amount', _style: { width: '5%' } },
    { key: 'transactionDate', label: 'Transaction Date', _style: { width: '8%' }, sorter: true },
    { key: 'chargeBackDate', label: 'Chargeback Date', _style: { width: '8%' }, sorter: true },
    { key: 'transactionStatus', label: 'Transaction Status', _style: { width: '7%', textAlign: 'center' } },
    { key: 'refundStatus', label: 'Refund Status', _style: { width: '7%', textAlign: 'center' } },
    { key: 'chargeBackStatus', label: 'Chargeback Status', _style: { width: '7%', textAlign: 'center' } },
    { key: 'actions', label: 'Actions', _style: { width: '3%', textAlign: 'center' } },
  ]

  useFetchOperators('SP', filters.region, 'Collection', filters.operatorId, setOperators, setLoader)
  useFetchMerchants(filters.region, setMerchants, setLoader)

  const updateChargeBackIcon = (region: string) => {
    if (filters.region.toLowerCase() === 'pakistan') {
      setChargeBackIcon(chargebackPK.src)
    }
    if (filters.region.toLowerCase() === 'bangladesh') {
      setChargeBackIcon(chargebackBDT.src)
    }

  }

  //   const pdfcolumns: PDFTableColumn[] = [
  //     { dataKey: 'templateName', header: 'Configuration Title' },
  //     { dataKey: 'channel', header: 'Channel' },
  //     { dataKey: 'account_route', header: 'Account Route' },
  //     { dataKey: 'makerCheckerStatus', header: 'Status' },
  //     { header: 'Created At', dataKey: 'createdDate' },
  //     { header: 'Updated At', dataKey: 'updateDate' },
  //   ]

  //   const handleDownloadPDF = () => {
  //     generatePDF('Operator Configuration List', pdfcolumns, list, 'op_config_list')
  //   }

  //   const handleDownloadCSV = () => {
  //     generateCSV('Operator Configuration List', pdfcolumns, list)
  //   }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target) {
      const { id, value } = e.target

      if (id === "transactionDateType" || id === "chargebackDateType") {
        setFilters((prev) => ({
          ...prev,
          isDateTransaction: id === "transactionDateType",
        }))
        return
      }

      if (id === 'region' && !value) {
        setOperators([])
      }

      setFilters({
        ...filters,
        [id]: value,
      })

      if (id === 'date') {
        const now = new Date()
        const todayDate = now.toISOString().split('T')[0]

        setFilters((prev) => ({
          ...prev,
          [id]: value,
          today: value === todayDate,
        }))
      }
    }
  }

  const clearFilters = async () => {
    setFilters({
      search: '',
      region: '',
      operatorId: '',
      merchantId: '',
      isDateTransaction: true,
      date: '',
      today: false,
    })
    setOperators([])
    setMerchants([])
  }

  const handleCloseModal = (modal: 'initiate' | 'view') => {
    if (modal === 'initiate') {
      setShowInitiateModal(false)
    } else {
      setShowViewModal(false)
    }

    setSelectedTransaction(emptyChargeBack)
  }

  // const validateTransactionIds = (): boolean => {
  //   const { transactionIds } = filters

  //   if (!transactionIds || transactionIds.trim() === "") {
  //     showToast("error", "Transaction IDs cannot be empty.");
  //     return false
  //   }

  //   // Split and trim each part
  //   const ids = transactionIds.split(",").map(id => id.trim());

  //   // Check for empty entries (e.g. "123,,456" or trailing comma "123,")
  //   if (ids.some(id => id === "")) {
  //     showToast("error", "Transaction IDs cannot be empty values.");
  //     return false
  //   }

  //   // Check for non-numeric IDs
  //   for (const id of ids) {
  //     if (!/^\d+$/.test(id)) {
  //       showToast("error", `Invalid transaction ID: "${id}". Only digits are allowed.`);
  //       return false
  //     }
  //   }

  //   // Check for duplicates
  //   const uniqueIds = new Set(ids);
  //   if (uniqueIds.size !== ids.length) {
  //     showToast("error", "Duplicate transaction IDs are not allowed.");
  //     return false
  //   }

  //   return true;
  // }


  const validateSearchParameters = () => {
    const { region, operatorId, date } = filters

    return region && operatorId && date
  }

  const handleSearch = async () => {
    setValidated(false)

    const validParameters = validateSearchParameters()

    if (!validParameters) {
      setValidated(true)
      showToast('error', 'Please fill the required fields!')
      return
    }

    // const validTransactionIds = validateTransactionIds()

    // if (!validTransactionIds) {
    //   setInvalidTransactionIDs(true)
    //   return
    // }

    setLoader(true)

    const { isDateTransaction, ...restFilters } = filters

    const reqBody = {
      ...restFilters,
      search: filters.search ? filters.search : null,
      region: filters.region.toLowerCase(),
      merchantId: filters.merchantId ? filters.merchantId : undefined,
      isDateOfTransaction: isDateTransaction
    }

    await api
      .post(`/corporate/chargeback/get-transactions`, reqBody)
      .then((chargeBackResponse) => {
        if (chargeBackResponse.status === 200 && chargeBackResponse.data.status === '0000') {
          const chargeBackData = chargeBackResponse.data.data.charge_back_transaction
          if (chargeBackData.length > 0) {
            setChargebackList(chargeBackData)
          } else {
            setChargebackList([])
            showToast("error", "No records were found.")
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching chargebacks: ', error)
      })
      .finally(() => {
        setLoader(false)
        updateChargeBackIcon(filters.region)
      })
  }

  useEffect(() => {
      const element = document.querySelector('.tableBorder > div:nth-child(2)')
      if (element) {
        element.classList.add('card')
      }
    }, [])

  return (
    <>
      <CRow>
        <Loader isLoading={loader} />
        <CCol xs={12}>
          <CRow className="px-5">
            <CCardBody>
              <CRow>
                <CCol className="mb-3" xs={6}>
                  <h4>Chargeback List</h4>
                </CCol>
                <CCol className="mb-3 text-end" xs={6}>
                  {/* <ExportDropdownComponent
                    onPDFExport={handleDownloadPDF}
                    onCSVExport={handleDownloadCSV}
                  /> */}
                </CCol>
              </CRow>
              <CRow>
                <CCol className='ms-2'>
                  <CFormLabel htmlFor='searchBy' className='d-block'>Search By Date</CFormLabel>
                  <CFormCheck inline type='radio' id='transactionDateType' value='Transaction' label='Transaction' onChange={handleFilterChange} checked={filters.isDateTransaction}/>
                  <CFormCheck inline type='radio' id= 'chargebackDateType' value='Chargeback' label='Chargeback' onChange={handleFilterChange} checked={!filters.isDateTransaction}/>
                </CCol>
              </CRow>
              <CRow className="filter-overlay">
                <CCol xs={12} className="filter-overlay-content">
                  <CRow>
                    <CCol md={3}>
                      <CFormLabel htmlFor="region">Region</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="region"
                          value={filters.region}
                          onChange={handleFilterChange}
                          required
                          className={validated && !filters.region ? 'is-invalid mt-2' : 'mt-2'}
                        >
                          <option value="">Select Region</option>
                          {configRegions.map((r) => (
                            <option key={`${r.value}`} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CFormLabel htmlFor="operatorId">Operator</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CMultiSelect
                          id="operatorId"
                          placeholder="Select operator"
                          multiple={false}
                          options={operators}
                          resetSelectionOnOptionsChange={true}
                          onChange={(selected) => {
                            setFilters((prevData) => ({
                              ...prevData,
                              operatorId: selected.length ? selected[0].value.toString() : '',
                            }))
                          }}
                          optionsTemplate={(option) => (
                            <div className="d-flex">
                              <CImage
                                className="me-2"
                                src={operatorLogo(option.value)}
                                width={24}
                                height={24}
                              />{' '}
                              {option.label}
                            </div>
                          )}
                          optionsStyle="text"
                          required
                          virtualScroller
                          className={
                            validated && (!filters.operatorId || filters.operatorId.length === 0)
                              ? 'is-invalid mt-2'
                              : 'mt-2'
                          }
                        />
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CFormLabel htmlFor="merchantId">Merchant ID</CFormLabel>
                      <CInputGroup>
                        <CMultiSelect
                          id="merchantId"
                          placeholder="Select merchant"
                          multiple={false}
                          options={merchants}
                          resetSelectionOnOptionsChange={true}
                          onChange={(selected) => {
                            setFilters((prevData) => ({
                              ...prevData,
                              merchantId: selected.length ? selected[0].value.toString() : '',
                            }))
                          }}
                          optionsStyle="text"
                          required
                          virtualScroller
                          className="mt-2"
                        />
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CFormLabel htmlFor="date">{filters.isDateTransaction ? 'Transaction' : 'Chargeback'} Date</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          type="date"
                          id="date"
                          placeholder="Enter transaction date"
                          value={filters.date}
                          onChange={handleFilterChange}
                          required
                          className={validated && !filters.date ? 'is-invalid mt-2' : 'mt-2'}
                        />
                        <CButton
                        onClick={clearFilters}
                        color="light"
                        className="filter-btn mt-2 ms-3 py-0"
                        size="sm"
                      >
                        <CIcon icon={cilX} className="sm"></CIcon> Clear
                      </CButton>
                      </CInputGroup>
                    </CCol>
                  </CRow>
                  <CRow className="p-2"></CRow>
                </CCol>
              </CRow>
              <CRow className="search-overlay">
                <CCol xs={12} className="filter-overlay-content">
                  <CRow className='mb-2'>
                      <CFormLabel htmlFor="search">Search</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          id="search"
                          placeholder="Enter Mobile Number or Integration ID or Transaction ID(s)"
                          value={filters.search}
                          onChange={handleFilterChange}
                          className="mt-2"
                        />
                          <CButton
                            onClick={handleSearch}
                            color="light"
                            className="filter-btn mt-2 ms-3"
                            size="sm"
                          >
                            <CIcon icon={cilSearch} className="sm"></CIcon> Search
                          </CButton>
                      </CInputGroup>
                  </CRow>
                </CCol>
              </CRow>
              <CRow className="p-3"></CRow>
              <div className="tableBorder">
                <CSmartTable
                  tableBodyProps={{ className: 'align-middle' }}
                  sorterValue={{ column: 'date', state: 'desc' }}
                  tableProps={{ striped: true, hover: true, className: 'custom-table' }}
                  items={chargebackList}
                  columns={columns}
                  itemsPerPageSelect
                  itemsPerPage={10}
                  pagination
                  scopedColumns={{
                    transactionStatus: (item: { transactionStatus: string }) => (
                      <td className='text-center'>
                        {(() => {
                          return item.transactionStatus ? (
                            <CBadge className={getTransactionStatusClass(item.transactionStatus).className}>
                              {getTransactionStatusClass(item.transactionStatus).label}
                            </CBadge>
                          ) : (
                            <div>—</div>
                          )
                        })()}
                      </td>
                    ),
                    chargeBackStatus: (item: { chargeBackStatus: string }) => (
                      <td className='text-center'>
                        {(() => {
                          return item.chargeBackStatus ? (
                            <CBadge className={ChargebackStatusColors[item.chargeBackStatus]}>
                              {item.chargeBackStatus}
                            </CBadge>
                          ) : (
                            <div>—</div>
                          )
                        })()}
                      </td>
                    ),
                    refundStatus: (item: { refundStatus: string }) => (
                      <td className='text-center'>
                        {(() => {
                          const refundStatus = getRefundStatus(item.refundStatus)
                          return refundStatus ? (
                            <CBadge className={refundStatus.className}>{refundStatus.label}</CBadge>
                          ) : (
                            <div>—</div>
                          )
                        })()}
                      </td>
                    ),
                    transactionDate: (item: { transactionDate: string }) => (
                      <td>{CommonUtil.formatDate(item.transactionDate, 'short')}</td>
                    ),
                    chargeBackDate: (item: { chargeBackDate: string }) => (
                      <td>{CommonUtil.formatDate(item.chargeBackDate, 'short')}</td>
                    ),
                    actions: (item: ChargeBackData) => (
                      <td className='text-center'>
                        {item.chargeBackStatus && (
                          <CButton
                            className="tableIcon"
                            size="sm"
                            title="View Chargeback"
                            onClick={() => {
                              setViewTransaction(item)
                              setShowViewModal(true)
                            }}
                          >
                            <i className="bi bi-eye"></i>
                          </CButton>
                        )}
                        {!item.chargeBackStatus && (
                          <CButton
                            className="tableIcon"
                            size="sm"
                            title="Initiate Chargeback"
                            onClick={() => {
                              setSelectedTransaction(item)
                              setShowInitiateModal(true)
                            }}
                            // 1. initiation is not allowed if the transaction was cancelled
                            // 2. initiation is not allowed if the refund was started and didn't fail
                            disabled={(item.transactionStatus == '11') || (item.refundStatus !== null && item.refundStatus != '2')}
                          >
                            <img src={chargeBackIcon} alt="initiate" width={16} height={16} />
                          </CButton> 
                        )} 
                      </td>
                    ),
                  }}
                />
              </div>
            </CCardBody>
          </CRow>
        </CCol>
      </CRow>
      <InitiateModal
        visible={showInitiateModal}
        onClose={() => handleCloseModal('initiate')}
        setLoader={setLoader}
        transaction={selectedTransaction}
        reloadTable={() => handleSearch()}
        filters={filters}
        operators={operators}
      />
      <ViewModal
        visible={showViewModal}
        onClose={() => handleCloseModal('view')}
        setLoader={setLoader}
        transaction={viewTransaction}
        filters={filters}
        operators={operators}
      />
      <ToastNotification />
    </>
  )
}

export default DisputeEscalation
