'use client'

import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import CSVImage from '@/public/images/downloadIcon/oldcolorCSV.svg'
import PDFImage from '@/public/images/downloadIcon/oldcolorPDF.svg'
import TXTImage from '@/public/images/downloadIcon/oldcolorTXT.svg'
import { selectUserAuth, useTypedSelector } from '@/store'
import { api } from '@/utils/axios'
import { CommonUtil } from '@/utils/common'
import { cilFilter, cilSearch, cilShortText, cilX } from '@coreui/icons'
import { CIcon } from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCardBody,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CModal,
  CModalBody,
  CModalHeader,
  CModalTitle,
  CRow,
  CSmartTable,
} from '@coreui/react-pro'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const ReportList = () => {
  const { showToast } = useToastNotification()

  const userAuth = useTypedSelector(selectUserAuth)

  const [filters, setFilters] = useState({
    search: '',
    screen: 'all',
    role: 'all',
    status: 'all',
  })
  const [loader, setLoader] = useState(false)
  const [privileges, setPrivileges] = useState([])
  const [screen, setScreen] = useState<string>()
  const [list, setList] = useState<any[]>([])
  const router = useRouter()

  const [reportList, setReportList] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [reportFilterObject, setReportFilterObject] = useState({
    showFilter: false,
    fields: {
      reportTitle: '',
      format: '',
      status: '',
    },
  })

  const [filteredList, setFilteredList] = useState<any[]>([])

  const handleSearch = () => {
    const filteredData = reportFilterObject.showFilter
      ? list.filter((item) => {
          const { reportTitle, format, status } = reportFilterObject.fields
          return (
            (!reportTitle || item.reportTitle.toLowerCase().includes(reportTitle.toLowerCase())) &&
            (!format || item.format === format) &&
            (!status || item.status === status)
          )
        })
      : list

    setFilteredList(filteredData)
  }

  const handleDownload = (file: any) => {
    const anchor = document.createElement('a')
    anchor.href = file.filePath
    anchor.download = file.name
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  }

  useEffect(() => {
    const element = document.querySelector('.tableBorder > div:nth-child(2)')
    if (element) {
      element.classList.add('card')
    }
  }, [])

  const columns = [
    {
      key: 'reportTitle',
      label: 'Report Title',
      _style: { width: '15%' },
    },
    {
      key: 'format',
      label: 'Format',
      _style: { width: '10%' },
    },
    { key: 'expiry', label: 'Expiry Timer', _style: { width: '10%' }, sorter: true, filter: false },
    {
      key: 'status',
      label: 'Status',
      _style: { width: '10%' },
    },
    {
      key: 'createdDate',
      label: 'Created at',
      _style: { width: '15%' },
      sorter: true,
      filter: false,
    },
    { key: 'files', label: 'Download', _style: { width: '15%' }, sorter: true, filter: false },
  ]

  const handleReportFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setReportFilterObject((reportFilterObject) => ({
      ...reportFilterObject,
      fields: {
        ...reportFilterObject.fields,
        [id]: value,
      },
    }))
  }

  const buildQueryParams = () => {
    let queryParams: { [key: string]: string } = {}
    if (filters.search) queryParams.search = filters.search
    if (screen && screen !== '') queryParams.pageCode = screen
    if (filters.role !== 'all') queryParams.role = filters.role
    if (filters.status !== 'all') queryParams.status = filters.status
    return queryParams
  }

  const getReportList = async () => {
    setLoader(true)

    api
      .post('bulkReporting/list', {
        orderBy: 'requestedAt',
        direction: 'desc',
        pageNo: 0,
        limit: 100,
        search: '',
        isCorporate: true,
      })
      .then((response) => {
        console.log(response)

        if (response.status == 200) {
          setList(response.data.content)
          setFilteredList(response.data.content)
        }
      })
      .catch((error) => {
        console.error('Error fetching list:', error)
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
    getReportList()
  }, [])

  function openReports(files: any[]) {
    setReportList(files.map((file) => ({ ...file, name: file.filePath.split('/').pop() })))
    setModalVisible(true)
  }

  return (
    <CRow>
      <Loader isLoading={loader} />
      <CCol xs={12}>
        <CRow className="px-5">
          <CCardBody>
            <CRow>
              <CCol className="mb-3" xs={12}>
                <h4>Report List</h4>
              </CCol>
            </CRow>
            <CRow>
              <CRow>
                <CCol xs={4}></CCol>
                <CCol className="text-end" xs={8}>
                  <CButton
                    onClick={() => {
                      setReportFilterObject((reportFilterObject) => ({
                        ...reportFilterObject,
                        showFilter: true,
                      }))
                    }}
                    color="light"
                    className="filter-btn me-2"
                    size="sm"
                  >
                    <CIcon icon={cilFilter} size="sm" /> Filter
                  </CButton>
                  <Link href="/bulk-report/generate">
                    <CButton className="btnCustom" color="primary" size="sm">
                      <CIcon icon={cilShortText} size="sm" /> Generate New Report
                    </CButton>
                  </Link>
                </CCol>
              </CRow>
            </CRow>
            {reportFilterObject.showFilter && (
              <CRow className="filter-overlay">
                <CCol xs={12} className="filter-overlay-content">
                  <CRow>
                    <CCol md={4}>
                      <CFormLabel htmlFor="productType">Product Type</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          id="reportTitle"
                          value={reportFilterObject.fields.reportTitle}
                          onChange={handleReportFilterChange}
                          placeholder="Enter Report Title"
                        />
                      </CInputGroup>
                    </CCol>

                    <CCol md={4}>
                      <CFormLabel htmlFor="format">Format</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="format"
                          value={reportFilterObject.fields.format}
                          onChange={handleReportFilterChange}
                          placeholder="Format Filter"
                        >
                          <option value="">Select Format</option>
                          {/* <option value="pdf">PDF</option> */}
                          <option value="txt">TXT</option>
                          <option value="csv">CSV</option>
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol md={4}>
                      <CFormLabel htmlFor="status ">Status</CFormLabel>
                      <CFormSelect
                        id="status"
                        value={reportFilterObject.fields.status}
                        onChange={handleReportFilterChange}
                        placeholder="Status Filter"
                      >
                        <option value="">Select Status</option>
                        <option value="completed">Completed</option>
                        <option value="no record">No Record</option>
                        <option value="pending">Pending</option>
                        <option value="error">Error</option>
                      </CFormSelect>
                    </CCol>
                  </CRow>
                  <CRow className="p-2"></CRow>
                  <CRow>
                    <CCol className="text-end" xs={12}>
                      <CButton
                        onClick={() => {
                          setReportFilterObject({
                            showFilter: false,
                            fields: {
                              reportTitle: '',
                              format: '',
                              status: '',
                            },
                          })
                          setFilteredList(list)
                        }}
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
                sorterValue={{ column: 'createdDate', state: 'desc' }}
                tableProps={{ striped: true, hover: true, className: 'custom-table' }}
                items={filteredList}
                columns={columns}
                itemsPerPageSelect
                itemsPerPage={10}
                pagination
                scopedColumns={{
                  reportTitle: (item: { reportTitle: string }) => <td>{item.reportTitle}</td>,
                  expiry: (item: { expiry: string }) => <td>{item.expiry}D</td>,
                  status: (item: { status: string }) => (
                    <td>
                      {(() => {
                        if (item.status == 'completed') {
                          return (
                            <CBadge color="success successStatus">
                              {item.status.toUpperCase()}
                            </CBadge>
                          )
                        } else if (item.status == 'no record') {
                          return (
                            <CBadge color="secondary otherStatus">
                              {item.status.toUpperCase()}
                            </CBadge>
                          )
                        } else if (item.status == 'pending') {
                          return (
                            <CBadge color="warning pendingStatus">
                              {item.status.toUpperCase()}
                            </CBadge>
                          )
                        } else {
                          return (
                            <CBadge color="danger failedStatus">{item.status.toUpperCase()}</CBadge>
                          )
                        }
                      })()}
                    </td>
                  ),
                  format: (item: { format: string }) => (
                    <td>
                      {(() => {
                        // if (item.format == 'csv') {
                        //   return <i className="bi bi-filetype-csv text-success h3"></i>
                        // } else if (item.format == 'pdf') {
                        //   return <i className="bi bi-filetype-pdf text-danger h3"></i>
                        // } else {
                        //   return <i className="bi bi-filetype-txt text-primary h3"></i>
                        // }

                        if (item.format == 'csv') {
                          return <Image className="downloadIcon" src={CSVImage} alt="head" />
                        } else if (item.format == 'pdf') {
                          return <Image className="downloadIcon" src={PDFImage} alt="head" />
                        } else {
                          return <Image className="downloadIcon" src={TXTImage} alt="head" />
                        }
                      })()}
                    </td>
                  ),
                  createdDate: (item: { createdDate: string }) => (
                    <td>{CommonUtil.formatDate(item.createdDate, 'short')}</td>
                  ),
                  files: (item: { files: any[]; status: string }) => (
                    <td>
                      <CBadge
                        className={`badge border border-secondary text-secondary pe-auto ${
                          item.files.length && item.status == 'completed' ? 'bg-completed' : ''
                        }`}
                        title="View Files"
                        onClick={() => {
                          if (item.files.length && item.status == 'completed') {
                            openReports(item.files)
                          }
                        }}
                        style={{
                          cursor:
                            item.files.length && item.status == 'completed' ? 'pointer' : 'initial',
                        }}
                      >
                        <i className="bi bi-eye fst-normal fw-bold">{` (${item.files.length}) File(s)`}</i>
                      </CBadge>
                    </td>
                  ),
                }}
              />
            </div>
          </CCardBody>
        </CRow>
      </CCol>
      <CModal
        visible={modalVisible}
        alignment="center"
        size="lg"
        onClose={() => setModalVisible(false)}
      >
        <CModalHeader>
          <CModalTitle>Available Reports</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {/* <CRow>
            <CCol>
              <strong>Name</strong>
            </CCol>
            <CCol>
              <strong>Action</strong>
            </CCol>
          </CRow> */}
          {reportList.map((file, index) => (
            <CRow key={file.id} className="align-items-center my-2">
              <CCol md={9}>{file.name}</CCol>
              <CCol>
                <CBadge
                  className="badge border border-secondary text-secondary pe-auto bg-completed"
                  title="Download File"
                  onClick={() => handleDownload(file)}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-download fst-normal fw-bold"> Download</i>
                </CBadge>
              </CCol>
            </CRow>
          ))}
        </CModalBody>
      </CModal>

      <ToastNotification />
    </CRow>
  )
}

export default ReportList
