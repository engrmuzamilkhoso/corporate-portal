'use client'

import ExportDropdownComponent from '@/components/ExportDropdownComponent'
import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import { api } from '@/utils/axios'
import { CommonUtil } from '@/utils/common'
import { generateCSV, generatePDF, getCSVDownloadLink } from '@/utils/export'
import { PDFTableColumn } from '@/utils/pdf'
import { TaskStatus } from '@/utils/status.enum'
import { cibExpertsExchange, cilFile, cilFilter, cilPencil, cilSearch, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCardBody,
  CCol,
  CDateRangePicker,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CRow,
  CSmartTable,
} from '@coreui/react-pro'
import { format, parse } from 'date-fns'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const MDRList = () => {
  const { showToast } = useToastNotification()

  const userAuth = useTypedSelector(selectUserAuth)

  const [filters, setFilters] = useState({
    search: '',
    screen: 'all',
    role: 'all',
    status: 'all',
    productType: '',
    mdrType: '',
    accountType: '',
    endDate: '',
    startDate: '',
  })
  const [loader, setLoader] = useState(false)
  const [privileges, setPrivileges] = useState([])
  const [screen, setScreen] = useState<string>()
  const [list, setList] = useState<any[]>([])
  const [showFilter, setShowFilter] = useState(true)
  const [makerId, setMakerId] = useState<string | null>(null)
  const router = useRouter()

  //
  // const clearSearch = () => {
  //   setSearchText('')
  //   handleSearch()
  // }

  const columns = [
    { key: 'fieldName', label: 'MDR Title', _style: { width: '15%' } },
    { key: 'productType', label: 'Product Type', _style: { width: '10%' } },
    // { key: 'mdrType', label: 'MDR Type', _style: { width: '10%' } },
    { key: 'accountType', label: 'Account Type', _style: { width: '10%' }, sorter: true },
    { key: 'state', label: 'Status', _style: { width: '10%' } },
    { key: 'createdAt', label: 'Created at', _style: { width: '15%' }, sorter: true },
    { key: 'updatedAt', label: 'Updated at', _style: { width: '15%' } },
    { key: 'actions', label: 'Actions', _style: { width: '10%' } },
  ]
  const pdfcolumns: PDFTableColumn[] = [
    { header: 'MDR Title', dataKey: 'fieldName' },
    { header: 'Product Type', dataKey: 'productType' },
    // { header: 'MDR Type', dataKey: 'mdrType' },
    { header: 'Account Type', dataKey: 'accountType' },
    { header: 'Status', dataKey: 'state' },
    { header: 'Created At', dataKey: 'createdAt' },
    { header: 'Updated At', dataKey: 'updatedAt' },
  ]

  const handleDownloadPDF = () => {
    generatePDF('MDR Rate List', pdfcolumns, list, 'mdr_rate_list')
  }

  const handleDownloadCSV = () => {
    generateCSV('MDR Rate List', pdfcolumns, list)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFilters({
      ...filters,
      [id]: value,
    })
  }

  function updateMDRStatus(id: string) {
    router.push(`/mdr/status-update?id=${id}`)
  }

  const buildQueryParams = () => {
    let queryParams: { [key: string]: string } = {}
    if (filters.search) queryParams.title = filters.search
    if (screen && screen !== '') queryParams.pageCode = screen
    if (filters.role !== 'all') queryParams.role = filters.role
    if (filters.status !== 'all') queryParams.status = filters.status
    if (filters.accountType !== '') queryParams.accountType = filters.accountType
    if (filters.mdrType !== '') queryParams.mdrType = filters.mdrType
    if (filters.productType !== '') queryParams.productType = filters.productType
    if (filters.startDate !== '') queryParams.startDate = filters.startDate
    if (filters.endDate !== '') queryParams.endDate = filters.endDate
    return queryParams
  }
  const clearFilters = async () => {
    setShowFilter(false)
    setFilters({
      search: '',
      screen: 'all',
      role: 'all',
      status: 'all',
      productType: '',
      mdrType: '',
      accountType: '',
      endDate: '',
      startDate: '',
    })
    setLoader(true)
    await api
      .post('/corporate/mdrRates/list', {
        screenCode: 'TEMPLATECREATE',
        userId: userAuth.id,
      })
      .then((response) => {
        if (response.data.status == '0000') {
          setList(response.data.data)
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoader(false)
      })
  }
  const handleSearch = async () => {
    setLoader(true)
    const queryParams = buildQueryParams()
    console.log(queryParams)
    let makerId = null
    const makerCheckerResponse = await api
      .post('corporate/makerCheckerRole/list', {
        search: userAuth.email,
        pageCode: 'MDRCREATE',
        role: 'Maker',
      })
      .then((response) => {
        if (response.status == 200 && response.data.content.length > 0) {
          makerId = response.data.content[0].id
          setMakerId(makerId)
        }
      })
      .catch((error) => {
        console.log(error)
      })
    await api
      .post(
        `/corporate/mdrRates/list?makerId=${makerId}&getAll=${
          (userAuth.role as string).toLowerCase() === 'corpadmin' ||
          (userAuth.role as string).toLowerCase() === 'admin'
        }`,
        queryParams,
      )
      .then((response) => {
        if (response.data.status == '0000') {
          setList(response.data.data)
          setLoader(false)
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoader(false)
      })
  }

  const fetchPrivileges = async () => {
    try {
      await api.post('/corporate/makerCheckerRole/privileges').then((response) => {
        const transformedData = response.data.map((item: { name: string; code: string }) => ({
          value: item.code,
          label: item.name,
        }))
        setPrivileges(transformedData)
      })
    } catch (error) {
      console.error('Error fetching privileges:', error)
    }
  }

  useEffect(() => {
    fetchPrivileges()
    handleSearch()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const element = document.querySelector('.tableBorder > div:nth-child(2)')
    if (element) {
      element.classList.add('card')
    }
  }, [])

  function handleEdit(item: any) {
    router.push(`/mdr/update?id=${item}`)
    // if (item.maker === true) {
    // } else {
    //   router.push(`/maker_checker/task-management/decision?id=${item.id}`)
    // }
  }

  function toggleFilter(param: any) {
    if (param === false) {
      handleSearch()
    }
    setShowFilter(param)
  }

  return (
    <CRow>
      <Loader isLoading={loader} />
      <CCol xs={12}>
        <CRow className="px-5">
          <CCardBody>
            <CRow>
              <CCol className="mb-3" xs={6}>
                <h4>MDR Rate List</h4>
              </CCol>
              <CCol className="mb-3 text-end" xs={6}>
                <CButton
                  onClick={() => {
                    toggleFilter(true)
                  }}
                  color="light"
                  className="filter-btn"
                  size="sm"
                >
                  <CIcon icon={cilFilter} size="sm" /> Filter
                </CButton>

                <ExportDropdownComponent
                  onPDFExport={handleDownloadPDF}
                  onCSVExport={handleDownloadCSV}
                />
              </CCol>
            </CRow>
            <CRow></CRow>
            {showFilter && (
              <CRow className="filter-overlay">
                <CCol xs={12} className="filter-overlay-content">
                  <CRow>
                    {/* <CCol md={4}>
                      <CFormLabel htmlFor="role">Title</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          id="search"
                          placeholder="Search by title"
                          value={filters.search}
                          onChange={handleFilterChange}
                        />
                      </CInputGroup>
                    </CCol> */}

                    <CCol md={4}>
                      <CFormLabel htmlFor="productType">Product Type</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="productType"
                          value={filters.productType}
                          onChange={handleFilterChange}
                          placeholder="Product Type Filter"
                        >
                          <option value="">Select Product Type</option>
                          <option value="Collection">Collection</option>
                          <option value="Disbursement">Disbursement</option>
                          <option value="Remittance">Remittance</option>
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    {/* <CCol md={3}>
                      <CFormLabel htmlFor="mdrType">MDR Type</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="mdrType"
                          value={filters.mdrType}
                          onChange={handleFilterChange}
                          placeholder="MDR Filter"
                        >
                          <option value="">Select MDR Type</option>
                          <option value="WHT">WHT</option>
                          <option value="FED">FED</option>
                          <option value="GTV">GTV</option>
                          <option value="CB-GVM">CB-GVM</option>
                          <option value="WHT (IT) -GVM">WHT (IT) -GVM</option>
                          <option value="Share">Share</option>
                          <option value="Contingency Charges">Contingency Charges</option>
                        </CFormSelect>
                      </CInputGroup>
                    </CCol> */}

                    <CCol md={4}>
                      <CFormLabel htmlFor="accountType">Account Type</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="accountType"
                          value={filters.accountType}
                          onChange={handleFilterChange}
                          placeholder="Account Filter"
                        >
                          <option value="">Select Account Type</option>
                          <option value="MG">MG</option>
                          <option value="SP">SP</option>
                          {/* <option value="Pex">Pex</option> */}
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol md={4}>
                      <CFormLabel htmlFor="dateRange">Date Range</CFormLabel>
                      <CDateRangePicker
                        calendars={1}
                        footer
                        locale="en-US"
                        onStartDateChange={(date) => {
                          let formattedDate
                          if (!date) {
                            formattedDate = ''
                          } else {
                            formattedDate = format(new Date(date!), 'yyyy-MM-dd')
                          }
                          setFilters({
                            ...filters,
                            startDate: formattedDate,
                          })
                        }}
                        onEndDateChange={(date) => {
                          let formattedDate
                          if (!date) {
                            formattedDate = ''
                          } else {
                            formattedDate = format(new Date(date!), 'yyyy-MM-dd')
                          }
                          setFilters({
                            ...filters,
                            endDate: formattedDate,
                          })
                        }}
                        inputDateParse={(date) =>
                          parse(date.toLocaleString(), 'yyyy-MM-dd', new Date())
                        }
                        inputDateFormat={(date) => format(new Date(date), 'yyyy-MM-dd')}
                      />
                      {/* <DateRangeFilter /> */}
                    </CCol>
                  </CRow>
                  <CRow className="p-2"></CRow>
                  <CRow>
                    <CCol className="text-end" xs={12}>
                      <CButton
                        onClick={clearFilters}
                        color="light"
                        className="filter-btn"
                        size="sm"
                      >
                        <CIcon icon={cilX} className="sm"></CIcon> Cancel
                      </CButton>

                      <CButton
                        onClick={handleSearch}
                        color="light"
                        className="filter-btn"
                        size="sm"
                      >
                        <CIcon icon={cilSearch} className="sm"></CIcon> Search
                      </CButton>
                    </CCol>
                  </CRow>
                </CCol>
              </CRow>
            )}
            <CRow className="p-3"></CRow>
            <div className="tableBorder">
              <CSmartTable
                tableBodyProps={{ className: 'align-middle' }}
                sorterValue={{ column: 'createdAt', state: 'desc' }}
                tableProps={{ striped: true, hover: true, className: 'custom-table' }}
                items={list}
                columns={columns}
                itemsPerPageSelect
                itemsPerPage={10}
                pagination
                scopedColumns={{
                  templateName: (item: { templateName: string }) => <td>{item.templateName}</td>,
                  role: (item: { maker: boolean; checker: boolean }) => {
                    if (item.maker) {
                      return <td>Maker</td>
                    } else if (item.checker) {
                      return <td>Checker</td>
                    } else {
                      return <td></td>
                    }
                  },
                  state: (item: { state: string }) => (
                    <td>
                      {(() => {
                        if (item.state.toLocaleLowerCase() == TaskStatus.Pending) {
                          return <CBadge color="warning pendingStatus">{item.state}</CBadge>
                        } else if (item.state.toLocaleLowerCase() == TaskStatus.Review) {
                          return (
                            <CBadge color="success reviewStatus">
                              {item.state == 'Review' ? 'In Review' : ''}
                            </CBadge>
                          )
                        } else if (item.state.toLocaleLowerCase() == TaskStatus.Approved) {
                          return <CBadge color="success successStatus">{item.state}</CBadge>
                        } else {
                          return <CBadge color="danger failedStatus">{item.state}</CBadge>
                        }
                      })()}
                    </td>
                  ),
                  createdAt: (item: { createdAt: string }) => (
                    <td>{CommonUtil.formatDate(item.createdAt, 'short')}</td>
                  ),
                  updatedAt: (item: { updatedAt: string }) => (
                    <td>{CommonUtil.formatDate(item.updatedAt, 'short')}</td>
                  ),
                  actions: (item: { state: string; id: string; makerId: string }) => (
                    <td>
                      <CButton
                        className="tableIcon"
                        size="sm"
                        title="View MDR"
                        onClick={() => {
                          handleEdit(item.id)
                        }}
                      >
                        <i className="bi bi-eye"></i>
                        {/* <CIcon icon={cilZoom} size="sm" /> */}
                      </CButton>
                      {item.state === 'Approved' &&
                        (item.makerId === makerId ||
                          (userAuth.role.toLowerCase() !== 'admin' &&
                            userAuth.role.toLowerCase() !== 'corpadmin')) && (
                          <CButton
                            className="tableIcon"
                            variant="outline"
                            size="sm"
                            title="Change MDR Status"
                            onClick={() => {
                              updateMDRStatus(item.id)
                            }}
                          >
                            <CIcon className="tableIcon" icon={cilPencil} size="sm" />
                          </CButton>
                        )}
                    </td>
                  ),
                }}
                // clickableRows
                // onRowClick={(item: any) => handleEdit(item)}
              />
            </div>
          </CCardBody>
        </CRow>
      </CCol>
      <ToastNotification />
    </CRow>
  )
}

export default MDRList
