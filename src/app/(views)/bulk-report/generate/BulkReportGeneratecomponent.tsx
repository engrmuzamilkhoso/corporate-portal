import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { useRouter } from 'next/navigation'
import api from '@/utils/axios'
import { save } from '@/utils/crudBtnTexts'
import {
  checkboxOptions,
  collectionTransactionType,
  disbursementTransactionType,
  merchantSummaryCheckboxOptions,
  reportState,
  reportStatus,
  revenueSummaryCheckboxOptions,
} from '@/utils/listExport'
import { cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CDateRangePicker,
  CForm,
  CFormCheck,
  CFormLabel,
  CFormSelect,
  CMultiSelect,
  CRow,
} from '@coreui/react-pro'
import { format, parse } from 'date-fns'
import { useEffect, useState } from 'react'
import { isDateRangeWithinMonths } from '@/utils/utility'

const BulkReportGenerateComponent = () => {
  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [operators, setOperators] = useState([])
  const [banks, setBanks] = useState([])
  const [merchants, setMerchants] = useState<
    {
      code: number
      value: number
      name: string
      label: string
      selected?: boolean
    }[]
  >([])
  const [isDateRangeExceeded, setIsDateRangeExceeded] = useState(false)
  const [shouldOptionsReset, setShouldOptionsReset] = useState(false)

  const [reportData, setReportData] = useState({
    region: '',
    productType: '',
    // region: 'Pakistan',
    // productType: 'collection',
    fileFormat: 'csv',
    dateFilter: { startDate: '', endDate: '' },
    transactionType: '',
    merchant: [],
    operatorsAndBanks: [],
    stateAndStatus: [],
    reportColumns: '',
  })

  const [selectedCheckboxes, setSelectedCheckboxes] = useState(checkboxOptions)
  const [modalVisible, setModalVisible] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [isSomeMerchantsDisabled, setIsSomeMerchantsDisabled] = useState(false)

  const { showToast } = useToastNotification()
  const router = useRouter()

  function getMaxEndDate() {
    const startDate = reportData.dateFilter.startDate
    console.log('getMaxEndDate: Start Date:', startDate)

    if (!startDate) {
      console.log('getMaxEndDate: No startDate, returning yesterday:', new Date())
      const today = new Date()

      today.setHours(0, 0, 0, 0)
      return new Date(today.setDate(today.getDate() - 1))
    }

    const start = new Date(startDate)
    const today = new Date()

    // Normalize times to avoid incorrect comparisons
    start.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    // If start date is today, return today's date
    if (start.getTime() === today.getTime()) {
      console.log('getMaxEndDate: Start date is today, returning today:', today)
      return today
    }

    // Calculate max end date (3 months from start)
    const maxEndDate = new Date(start)
    maxEndDate.setMonth(start.getMonth() + 3)
    maxEndDate.setDate(start.getDate() - 1)

    // Ensure maxEndDate does not exceed today and exclude today from options
    const result = maxEndDate > today ? new Date(today.setDate(today.getDate() - 1)) : maxEndDate
    console.log('getMaxEndDate Result:', result)
    return result
  }

  useEffect(() => {
    let options
    if (reportData.transactionType === 'merchant-summary') {
      options = merchantSummaryCheckboxOptions
    } else if (reportData.transactionType === 'revenue-summary') {
      options = revenueSummaryCheckboxOptions
    } else {
      options = checkboxOptions
    }
    setSelectedCheckboxes(options)
  }, [reportData.transactionType])

  useEffect(() => {
    fetchOperatorsAndBanks()
  }, [reportData.productType, reportData.region])

  const fetchOperatorsAndBanks = () => {
    setLoader(true)

    Promise.all([
      api.get(`/operator/getAllOperatorsTransaction?region=${reportData.region}`),
      api.post('bank/all'),
    ])
      .then(([operatorResponse, bankResponse]) => {
        if (operatorResponse.status == 200) {
          setOperators(
            operatorResponse.data.map((option: any) => ({
              ...option,
              label: option.name,
              value: option.id,
            })),
          )
        }
        if (bankResponse.status == 200) {
          setBanks(
            bankResponse.data.map((option: any) => ({
              ...option,
              label: option.name,
              value: option.code,
            })),
          )
        }
      })
      .catch((err) => {
        console.error('Error fetching Bank and Operators:', err)
      })
      .finally(() => {
        setLoader(false)
      })
  }

  const fetchMerchants = () => {
    setShouldOptionsReset(true)

    if (reportData.region === 'Bangladesh' && reportData.productType === 'disbursement') {
      setReportData((reportData) => ({ ...reportData, productType: 'collection' }))
    }
    let typeIds = ''
    if (reportData.productType === 'collection') {
      if (reportData.region === 'Pakistan') {
        typeIds = '1,2,3'
      } else if (reportData.region === 'Bangladesh') {
        typeIds = '6'
      }
    } else if (reportData.productType === 'disbursement') {
      typeIds = '4'
    } else {
      typeIds = '5'
    }
    setLoader(true)
    api
      .get(
        `merchant/v2/getAllMerchants?accountRoute=${null}&region=${
          reportData.region
        }&typeIds=${typeIds}`,
      )
      .then((responseMerchant) => {
        if (responseMerchant.status === 200) {
          const merchantList = (responseMerchant.data as []).map((merchant: any) => ({
            code: merchant.id,
            value: merchant.id,
            name: merchant.id + ' - ' + merchant.firstName + ' ' + merchant.lastName,
            label: merchant.id + ' - ' + merchant.firstName + ' ' + merchant.lastName,
          }))

          setMerchants(merchantList as [])
        }
      })
      .catch((err) => {
        console.error('Error fetching Bank and Operators:', err)
      })
      .finally(() => {
        setLoader(false)
      })
  }

  useEffect(() => {
    fetchMerchants()
  }, [reportData.productType, reportData.region])

  const handleRegionReset = (region: string) => {
    if (region === '') {
      setReportData((reportData) => ({
        ...reportData,
        productType: '',
        merchant: [],
        operatorsAndBanks: [],
      }))
      setOperators([])
      setBanks([])
      setMerchants([])
    }
  }

  const handleDateChange = () => {
    fetchOperatorsAndBanks()
  }

  useEffect(() => {
    // first resetting the operators and banks to clear the options

    setOperators([])
    setBanks([])
    handleDateChange()
  }, [reportData.dateFilter.endDate])

  const handleChange = (e: any) => {
    const { name, value } = e.target

    if (name === 'region') {
      handleRegionReset(value)
    }
    if (name === 'region' && reportData.productType === '') {
      setReportData((reportData) => ({ ...reportData, productType: 'collection' }))
    }
    setReportData((prevData) => {
      if (name === 'productType') {
        return {
          ...prevData,
          [name]: value,
          transactionType: '',
          operatorsAndBanks: [],
          stateAndStatus: [],
        }
      }
      return {
        ...prevData,
        [name]: value,
      }
    })
  }

  const handleCheckboxChange = (e: any) => {
    const { value } = e.target
    setSelectedCheckboxes((prevOptions) =>
      prevOptions.map((option) =>
        option.value === value ? { ...option, checked: !option.checked } : option,
      ),
    )
  }

  const validateForm = () => {
    const {
      productType,
      dateFilter,
      transactionType,
      merchant,
      operatorsAndBanks,
      stateAndStatus,
      reportColumns,
      region,
    } = reportData

    const transactionTypeCheck = productType === 'remittance' ? true : transactionType
    const selectedCustomColumnsCheck =
      reportColumns === 'custom'
        ? selectedCheckboxes.filter((option: { checked: boolean }) => option.checked).length
        : true

    return (
      transactionTypeCheck &&
      selectedCustomColumnsCheck &&
      dateFilter.startDate &&
      dateFilter.endDate &&
      merchant.length &&
      operatorsAndBanks.length &&
      stateAndStatus.length &&
      reportColumns &&
      region
    )
  }

  const handleSubmit = (e: any) => {
    setValidated(false)
    setIsDateRangeExceeded(false)
    console.log(reportData)

    e.preventDefault()

    const isFormValid = validateForm()

    if (!isFormValid) {
      setValidated(true)
      showToast('error', 'Please fill all required fields')
      return
    }

    const isDateRangeValid = isDateRangeWithinMonths(
      reportData.dateFilter.startDate,
      reportData.dateFilter.endDate,
    )

    if (!isDateRangeValid) {
      setValidated(true)
      setIsDateRangeExceeded(true)
      showToast('error', 'Date range exceeded')
      return
    }

    const todayDate = format(new Date(), 'yyyy-MM-dd')
    const submittedReportData = {
      reportName: `${reportData.productType}${
        reportData.productType !== 'remittance' && reportData.transactionType !== 'disbursement'
          ? `_${reportData.transactionType}`
          : ''
      }_${format(new Date(), 'yyyyMMddHHMMSS')}.${reportData.fileFormat}`,
      format: reportData.fileFormat,
      criteria: {
        dateRange: {
          fromDate: reportData.dateFilter.startDate,
          toDate: reportData.dateFilter.endDate,
          today:
            todayDate === reportData.dateFilter.endDate &&
            todayDate === reportData.dateFilter.startDate,
        },
        conditions: {
          category: reportData.productType,
          status: reportData.stateAndStatus.map((option: { value: string }) => option.value),
          merchant: reportData.merchant,
          bank:
            reportData.productType === 'collection'
              ? undefined
              : reportData.operatorsAndBanks.map((value) => value as string),
          operator:
            reportData.productType !== 'collection'
              ? undefined
              : (reportData.operatorsAndBanks[0] as string),
          transactionType: reportData.transactionType,
          region: reportData.region,
        },
        fieldType: reportData.reportColumns,
        criteriaType: 'custom',
        // reportType: reportData.reportType,
        fields: selectedCheckboxes
          .filter((option: { checked: boolean }) => option.checked)
          .map((option: { value: string }) => option.value),
      },
      status: 'pending',
      isCorporate: true,
    }

    setLoader(true)
    api
      .post('/bulkReporting', submittedReportData)
      .then((res: any) => {
        const response = res.data
        if (response.status != '0000') {
          showToast('error', (response.message as string).replace(/-/g, ' '))
        } else {
          showToast('success', 'Success', {
            onOpen: () => {
              setDisabled(true)
            },
            autoClose: 2000,
            onClose: () => {
              router.push('/bulk-report/list')
            },
          })
        }
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
        setLoader(false)
      })
  }

  return (
    <CContainer md className="px-4 ">
      <Loader isLoading={loader} />
      <CRow>
        <CCol xl={3}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h2 className="formTitle">Generate Bulk Report</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={9}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <CForm>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="region">Region</CFormLabel>
                    <CFormSelect
                      name="region"
                      value={reportData.region}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !reportData.region ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      <option value="">Select Region</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Bangladesh">Bangladesh</option>
                    </CFormSelect>
                  </CCol>

                  <CCol>
                    <CFormLabel htmlFor="productType">Product Type</CFormLabel>
                    <CFormSelect
                      name="productType"
                      value={reportData.productType}
                      onChange={handleChange}
                      required
                      disabled={disabled || reportData.region === ''}
                      className={validated && !reportData.productType ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      <option value="">Select Product Type</option>
                      {[
                        { value: 'collection', label: 'Collection' },
                        { value: 'disbursement', label: 'Disbursement' },
                        { value: 'remittance', label: 'Remittance' },
                      ]
                        .filter(
                          (option) =>
                            reportData.region !== 'Bangladesh' ||
                            ['collection', 'remittance'].includes(option.value),
                        )
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </CFormSelect>
                  </CCol>

                  <CCol md="4">
                    <CFormLabel htmlFor="dateFilter">Date Filter</CFormLabel>
                    <CDateRangePicker
                      footer
                      calendars={1}
                      locale="en-US"
                      disabled={disabled}
                      maxDate={getMaxEndDate()}
                      className={
                        validated &&
                        !(reportData.dateFilter.startDate && reportData.dateFilter.endDate)
                          ? 'is-invalid mt-2'
                          : 'mt-2'
                      }
                      onStartDateChange={(date) => {
                        let formattedDate
                        if (!date) {
                          formattedDate = ''
                        } else {
                          formattedDate = format(new Date(date!), 'yyyy-MM-dd')
                        }
                        setReportData((prevReportData) => ({
                          ...prevReportData,
                          dateFilter: {
                            ...prevReportData.dateFilter,
                            startDate: formattedDate,
                          },
                        }))
                      }}
                      onEndDateChange={(date) => {
                        let formattedDate
                        if (!date) {
                          formattedDate = ''
                        } else {
                          formattedDate = format(new Date(date!), 'yyyy-MM-dd')
                        }
                        setReportData((prevReportData) => ({
                          ...prevReportData,
                          dateFilter: {
                            ...prevReportData.dateFilter,
                            endDate: formattedDate,
                          },
                        }))
                      }}
                      inputDateParse={(date) =>
                        parse(date.toLocaleString(), 'yyyy-MM-dd', new Date())
                      }
                      inputDateFormat={(date) => format(new Date(date), 'yyyy-MM-dd')}
                    />
                    {validated && isDateRangeExceeded && (
                      <div className="invalid-feedback d-block">Date Range limit is 3 months.</div>
                    )}
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  {reportData.productType !== 'remittance' && (
                    <CCol>
                      <CFormLabel htmlFor="transactionType">Transaction Type</CFormLabel>

                      <CFormSelect
                        name="transactionType"
                        value={reportData.transactionType}
                        onChange={handleChange}
                        required
                        disabled={disabled}
                        className={validated && !reportData.transactionType ? 'is-invalid' : ''}
                      >
                        <option value="">Select Transaction Type</option>
                        {reportData.productType === 'collection' &&
                          collectionTransactionType.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        {reportData.productType === 'disbursement' &&
                          disbursementTransactionType.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                      </CFormSelect>
                    </CCol>
                  )}

                  <CCol>
                    <CFormLabel htmlFor="merchant">Merchant</CFormLabel>
                    <div className="custom-multi-select">
                      <CMultiSelect
                        name="merchant"
                        options={merchants}
                        selectionType={reportData.merchant.length > 1 ? 'counter' : 'tags'}
                        optionsStyle="text"
                        required
                        optionsMaxHeight={200}
                        // virtualScroller={true}
                        // visibleItems={4}
                        selectAll={false}
                        optionsTemplate={(option) => (
                          <div className="m-0" style={{ margin: '0' }}>
                            {option.label}
                          </div>
                        )}
                        onChange={(options) => {
                          if (options[0]) {
                            setShouldOptionsReset(false)
                            const selectedValues = options.map((option) => option.value) // Extract values from options

                            if (selectedValues.length > 4) {
                              const updatedMerchants = merchants.map((merchant) => {
                                if (selectedValues.includes(merchant.code)) {
                                  return { ...merchant, disabled: false, selected: true }
                                } else {
                                  return { ...merchant, disabled: true, selected: false }
                                }
                              })
                              setMerchants(updatedMerchants)
                              setIsSomeMerchantsDisabled(true)
                            } else if (selectedValues.length < 5 && isSomeMerchantsDisabled) {
                              const updatedMerchants = merchants.map((merchant) => {
                                if (selectedValues.includes(merchant.code)) {
                                  return { ...merchant, disabled: false, selected: true }
                                } else {
                                  return { ...merchant, disabled: false, selected: false }
                                }
                              })
                              setMerchants(updatedMerchants)
                              setIsSomeMerchantsDisabled(false)
                            }
                            setReportData((reportData) => ({
                              ...reportData,
                              merchant: selectedValues as never,
                            }))
                          } else {
                            if (isSomeMerchantsDisabled) {
                              setMerchants(
                                merchants.map((merchant) => ({
                                  ...merchant,
                                  selected: false,
                                  disabled: false,
                                })),
                              )
                            }
                            setReportData((reportData) => ({
                              ...reportData,
                              merchant: [],
                            }))
                          }
                        }}
                        resetSelectionOnOptionsChange={shouldOptionsReset}
                        clearSearchOnSelect
                        className={validated && !reportData.merchant.length ? 'is-invalid' : ''}
                        disabled={disabled || reportData.region === ''}
                        valid={false}
                      />
                    </div>
                    <div style={{ color: 'red', fontSize: '12px' }}>
                      maximum 5 merchants can be selected
                    </div>
                  </CCol>
                  <CCol>
                    <CFormLabel htmlFor="operatorsAndBanks">
                      {reportData.productType === 'collection' ? 'Operators' : 'Banks'}
                    </CFormLabel>
                    <CMultiSelect
                      name="merchant"
                      options={reportData.productType === 'collection' ? operators : banks}
                      multiple={
                        reportData.productType !== 'collection' ||
                        format(new Date(), 'yyyy-MM-dd') !== reportData.dateFilter.endDate
                      }
                      selectionType={reportData.operatorsAndBanks.length > 1 ? 'counter' : 'tags'}
                      optionsStyle="text"
                      required
                      // virtualScroller={true}
                      // visibleItems={5}
                      optionsMaxHeight={200}
                      clearSearchOnSelect
                      onChange={(options) => {
                        if (options[0]) {
                          setReportData((reportData) => ({
                            ...reportData,
                            operatorsAndBanks: options.map((option) => option.value as never),
                          }))
                        } else {
                          setReportData((reportData) => ({
                            ...reportData,
                            operatorsAndBanks: [],
                          }))
                        }
                      }}
                      resetSelectionOnOptionsChange
                      className={
                        validated && !reportData.operatorsAndBanks.length ? 'is-invalid' : ''
                      }
                      disabled={disabled || reportData.region === ''}
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol md={4}>
                    <CFormLabel htmlFor="stateAndStatus">
                      {reportData.productType === 'collection' ? 'Status' : 'State'}
                    </CFormLabel>
                    <CMultiSelect
                      placeholder={`Select ${
                        reportData.productType === 'collection' ? 'status' : 'state'
                      }`}
                      selectionType={reportData.stateAndStatus.length > 1 ? 'counter' : 'tags'}
                      virtualScroller
                      visibleItems={4}
                      disabled={disabled}
                      options={reportData.productType === 'collection' ? reportStatus : reportState}
                      onChange={(stateAndStatusOptions) => {
                        setReportData((prevReportData) => ({
                          ...prevReportData,
                          stateAndStatus: stateAndStatusOptions as [],
                        }))
                      }}
                      name="stateAndStatus"
                      resetSelectionOnOptionsChange
                      className={validated && !reportData.stateAndStatus.length ? 'is-invalid' : ''}
                    />
                  </CCol>

                  <CCol md="4">
                    <CFormLabel htmlFor="fileFormat">File Format</CFormLabel>

                    {/* <div className="mt-1">
                      <CButton
                        className="btnexp"
                     
                        title="CSV File Format"
                        disabled={disabled}
                        style={{
                          backgroundColor: reportData?.fileFormat === 'csv' ? 'green' : '#f0f0f0',
                          color: 'white',
                        }}
                        onClick={() => {
                          setReportData((prevReport) => ({ ...prevReport, fileFormat: 'csv' }))
                        }}
                      >
                        <i className="bi bi-filetype-csv"></i>
                      </CButton>

                      <CButton
                        className=" btnexp"
                   
                        title="TXT File Format"
                        disabled={disabled}
                        style={{
                          backgroundColor: reportData?.fileFormat === 'txt' ? '#2b579a' : '#f0f0f0',
                          color: 'white',
                        }}
                        onClick={() => {
                          setReportData((prevReport) => ({ ...prevReport, fileFormat: 'txt' }))
                        }}
                      >
                        <i className="bi bi-filetype-txt"></i>
                      </CButton>
                    </div> */}
                    <div>
                      <button
                        className={`me-2 btnexp border-0 nav-link-style ${
                          reportData.fileFormat === 'csv' ? 'nav-link-style-active' : ''
                        }`}
                        type="button"
                        value="csv"
                        name="fileFormat"
                        disabled={disabled}
                        onClick={handleChange}
                      >
                        CSV <i className="bi bi-file-earmark-excel"></i>
                      </button>
                      <button
                        className={` btnexp border-0 nav-link-style ${
                          reportData.fileFormat === 'txt' ? 'nav-link-style-active' : ''
                        }`}
                        type="button"
                        value="txt"
                        name="fileFormat"
                        disabled={disabled}
                        onClick={handleChange}
                      >
                        TXT <i className="bi bi-file-text"></i>
                      </button>
                    </div>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="reportColumns">Report Columns</CFormLabel>
                    <div>
                      <button
                        className={`me-2 btn_rep border-0 nav-link-style ${
                          reportData.reportColumns === 'full' ? 'nav-link-style-active' : ''
                        }`}
                        type="button"
                        value="full"
                        name="reportColumns"
                        disabled={disabled}
                        onClick={(e) => {
                          handleChange(e)
                          setModalVisible(false)
                        }}
                      >
                        Full
                      </button>
                      <button
                        className={`me-2  btn_rep border-0 nav-link-style ${
                          reportData.reportColumns === 'sliced' ? 'nav-link-style-active' : ''
                        }`}
                        type="button"
                        value="sliced"
                        name="reportColumns"
                        disabled={disabled}
                        onClick={(e) => {
                          handleChange(e)
                          setModalVisible(false)
                        }}
                      >
                        Sliced
                      </button>
                      <button
                        className={`btn_rep border-0 nav-link-style ${
                          reportData.reportColumns === 'custom' ? 'nav-link-style-active' : ''
                        }`}
                        type="button"
                        value="custom"
                        name="reportColumns"
                        disabled={disabled}
                        onClick={(e) => {
                          handleChange(e)
                          setModalVisible(true)
                        }}
                      >
                        Custom
                      </button>
                    </div>
                    {validated && !reportData.reportColumns && (
                      <div className="invalid-feedback d-block">Please select a report column.</div>
                    )}
                  </CCol>

                  {/* <CCol>
                    <CFormLabel htmlFor="reportType">Report Type</CFormLabel>
                    <div>
                      <CButton
                        color="info"
                        variant={reportData.reportType === 'merchant' ? undefined : 'outline'}
                        value="merchant"
                        name="reportType"
                        disabled={disabled}
                        onClick={handleChange}
                      >
                        Merchant
                      </CButton>
                      <CButton
                        color="info"
                        variant={reportData.reportType === 'revenue' ? undefined : 'outline'}
                        className="mx-3"
                        value="revenue"
                        name="reportType"
                        disabled={disabled}
                        onClick={handleChange}
                      >
                        Revenue
                      </CButton>
                      <CButton
                        color="info"
                        variant={reportData.reportType === 'summary' ? undefined : 'outline'}
                        value="summary"
                        name="reportType"
                        disabled={disabled}
                        onClick={handleChange}
                      >
                        Summary
                      </CButton>
                    </div>
                    {validated && !reportData.reportType && (
                      <div className="invalid-feedback d-block">Please select a report type.</div>
                    )}
                  </CCol> */}
                </CRow>

                {/* {!modalVisible && ( */}
                <CRow className={`text-end fade ${!modalVisible ? 'show' : ' d-none'}`}>
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
                {/* )} */}
                {true && (
                  <CCard
                    style={{ border: 'none' }}
                    className={`fade ${modalVisible ? 'show' : ''}`}
                  >
                    <CCardBody>
                      <CRow>
                        <hr className="mt-1" />
                        <CCol md={10}>
                          <h2 className="formTitle">Custom Columns</h2>
                          <p className="formDescription">
                            {/* Please select the required columns for the report */}
                          </p>
                        </CCol>

                        <CCol className=" text-end">
                          {/* <CButton
                            variant={reportData.reportColumns === 'custom' ? undefined : 'outline'}
                            color="primary btnCustom mt-1"
                            style={{ background: '#5856d6' }}
                            onClick={(e) => {
                              setModalVisible(false)
                            }}
                          >
                          
                          </CButton> */}
                          <CIcon
                            size="xl"
                            icon={cilX}
                            style={{ cursor: 'pointer' }}
                            className="pe-auto"
                            onClick={(e) => {
                              setModalVisible(false)
                            }}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="d-flex flex-wrap mb-3">
                        {selectedCheckboxes
                          .filter((option) => {
                            // Show "total_deduction" ONLY for 'merchant' and 'merchant-summary'
                            if (option.value === 'total_deduction') {
                              return (
                                reportData.transactionType === 'merchant'
                                //  ||
                                // reportData.transactionType === 'merchant-summary'
                              )
                            }

                            // Show all other columns normally
                            return true
                          })
                          .map((option, index) => (
                            <CCol sm={4} className="my-2" key={index}>
                              <CFormCheck
                                id={option.value}
                                label={option.label}
                                value={option.value}
                                onChange={handleCheckboxChange}
                                checked={option.checked}
                                required
                                disabled={disabled}
                              />
                            </CCol>
                          ))}
                      </CRow>
                      <CRow>
                        {validated &&
                          reportData.reportColumns === 'custom' &&
                          selectedCheckboxes.filter(
                            (option: { checked: boolean }) => option.checked,
                          ).length === 0 && (
                            <div className="invalid-feedback d-block">
                              Please select columns for Custom Report.
                            </div>
                          )}
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
                    </CCardBody>
                  </CCard>
                )}
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {/* <CModal
        visible={modalVisible}
        alignment="center"
        size="lg"
        onClose={() => setModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Custom Reports</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CRow className="d-flex flex-wrap mb-3">
            {selectedCheckboxes.map((option, index) => (
              <CCol sm={4} className="my-2" key={index}>
                <CFormCheck
                  id={option.value}
                  label={option.label}
                  value={option.value}
                  onChange={handleCheckboxChange}
                  checked={option.checked}
                />
              </CCol>
            ))}
          </CRow>

          <CRow>
            <CCol xs={6} className="d-grid mb-3">
              <CButton color="primary" onClick={() => setModalVisible(false)}>
                {cancel}
              </CButton>
            </CCol>
            <CCol xs={6} className="d-grid mb-3">
              <CButton className="text-light" color="danger" onClick={() => setModalVisible(false)}>
                {save}
              </CButton>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal> */}
      <ToastNotification />
    </CContainer>
  )
}

export default BulkReportGenerateComponent
