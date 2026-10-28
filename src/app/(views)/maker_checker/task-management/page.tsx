'use client'

import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import { api } from '@/utils/axios'
import { CommonUtil } from '@/utils/common'
import { generateCSV, generatePDF, getCSVDownloadLink } from '@/utils/export'
import { PDFTableColumn } from '@/utils/pdf'
import { cilFilter, cilSearch, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCardBody,
  CCol,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CRow,
  CSmartTable
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'

import ExportDropdownComponent from '@/components/ExportDropdownComponent'
import { TaskStatus } from '@/utils/status.enum'
import React, { useEffect, useState } from 'react'

const TaskManagement = () => {
  const { showToast } = useToastNotification()

  const userAuth = useTypedSelector(selectUserAuth)

  const [filters, setFilters] = useState({
    search: '',
    screenCode: 'all',
    role: 'all',
    status: 'all',
  })
  const [loader, setLoader] = useState(false)
  const [privileges, setPrivileges] = useState([])
  const [screen, setScreen] = useState<string>()
  const [list, setList] = useState<any[]>([])
  const [showFilter, setShowFilter] = useState(false)
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [isAdmin, setIsAdmin] = useState((userAuth.role as string).toLowerCase() === 'corpadmin' || (userAuth.role as string).toLowerCase() === 'admin')
  const [pagination, setPagination] = useState({
    pageNo: 1,
    limit: 10,
  })
  const [totalElements, setTotalElements] = useState(0)

  const columns = [
    { key: 'taskTitle', label: 'Title', _style: { width: '12%' } },
    { key: 'role', label: 'Role', _style: { width: '7%' } },
    { key: 'status', label: 'Status', _style: { width: '10%' } },
    { key: 'screenCode', label: 'Screen', _style: { width: '10%' } },
    { key: 'makerEmail', label: 'Maker' },
    { key: 'checkerEmail', label: 'Checker' },
    { key: 'createdDate', label: 'Created at', _style: { width: '12%' }, sorter: true },
    { key: 'updateDate', label: 'Updated at', _style: { width: '12%' } },
  ]
  const pdfcolumns: PDFTableColumn[] = [
    { header: 'Title', dataKey: 'taskTitle' },
    { header: 'Role', dataKey: 'role' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Screen', dataKey: 'screenCode' },
    { header: 'Maker/Checker', dataKey: 'maker_checker' },
    { header: 'Created At', dataKey: 'createdDate' },
    { header: 'Updated At', dataKey: 'updateDate' },
  ]

  const handleDownloadPDF = () => {
    const dataForPDF = list.map((item: any) => ({
      ...item,
      maker_checker: `${item.makerEmail ?? '-'} / ${item.checkerEmail ?? '-'}`,
      role: `${item.checker ? 'Checker' : item.maker ? 'Maker' : '-'}`,
    }))

    generatePDF('Task List', pdfcolumns, dataForPDF, 'task_list')
  }

  const handleDownloadCSV = () => {
    const dataForPDF = list.map((item: any) => ({
      ...item,
      role: `${item.checker ? 'Checker' : item.maker ? 'Maker' : '-'}`,
      maker_checker: `${item.makerEmail ?? '-'} / ${item.checkerEmail ?? '-'}`,
    }))

    generateCSV('Task List', pdfcolumns, dataForPDF)
  }
  const csvContent = list
    .map((item: any) =>
      [
        item.templateName, // Include firstName
        item.feeType,
        item.product,
        item.displayName,
        item.makerCheckerStatus,
        item.createdDate,
        item.updateDate,
      ].join(','),
    )
    .join('\n')

  const csvCode = getCSVDownloadLink(list)
  // const csvCode = 'data:text/csv;charset=utf-8,SEP=,%0A' + encodeURIComponent(csvContent)
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFilters({
      ...filters,
      [id]: value,
    })
  }

  const buildQueryParams = () => {
    let queryParams: { [key: string]: string } = {}
    if (filters.search) queryParams.title = filters.search
    if (screen && screen !== '') queryParams.pageCode = screen
    if (filters.role !== 'all') queryParams.role = filters.role
    if (filters.screenCode !== 'all') queryParams.screenCode = filters.screenCode
    if (filters.status !== 'all') queryParams.status = filters.status
    return queryParams
  }
  const clearFilters = async () => {
    setShowFilter(false)
    setFilters({
      search: '',
      screenCode: 'all',
      role: 'all',
      status: 'all',
    })
    setLoader(true)
    await api
      .post('/corporate/feesTemplate/tasks', {
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
    queryParams.userId = userAuth.id
    queryParams.limit = pagination.limit.toString()
    queryParams.pageNo = (pagination.pageNo - 1).toString()

    await api
      .post('/corporate/feesTemplate/tasks', { ...queryParams, isAdmin, direction: 'desc' })
      .then((response) => {
        if (response.data.status == '0000') {
          setList(response.data.data)
          setTotalElements(response.data.totalElements)
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
  }, [pagination])

    useEffect(() => {
      const element = document.querySelector('.tableBorder > div:nth-child(2)');
      if (element) {
        element.classList.add('card');
      }
    }, []);

  function handleEdit(item: any) {
    console.log(item)

    if (item.maker === true) {
      router.push(`/maker_checker/maker-task-list/edit?id=${item.taskId}&type=${item.screenCode}`)
    } else if (item.checker === true) {
      router.push(
        `/maker_checker/task-management/decision?id=${item.taskId}&type=${item.screenCode}`,
      )
    } else {
      router.push(
        `/maker_checker/task-management/decision?id=${item.taskId}&type=${item.screenCode}&disabled=true`,
      )
    }
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
                <h4>Task List</h4>
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

                {/* <CDropdown className="">
                  <CDropdownToggle className="filter-btn" color="light" size="sm" caret={false}>
                    <i className="bi bi-download"></i> Export
                  </CDropdownToggle>
                  <CDropdownMenu>
                    <CDropdownItem onClick={handleDownloadPDF}>
                      <Image className="downloadIcon" src={PDFImage} alt="head" />
                       PDF
                    </CDropdownItem>
                    <CDropdownItem onClick={handleDownloadCSV}>
                      <Image className="downloadIcon" src={CSVImage} alt="head" /> CSV
                    </CDropdownItem>
                  </CDropdownMenu>
                </CDropdown> */}

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
                    <CCol md={3}>
                      <CFormLabel htmlFor="role">Title</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          id="search"
                          placeholder="Search by title"
                          value={filters.search}
                          onChange={handleFilterChange}
                        />
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CFormLabel htmlFor="role">Role</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="role"
                          value={filters.role}
                          onChange={handleFilterChange}
                          placeholder="Role Filter"
                        >
                          <option value="">Select Role</option>
                          <option value="Maker">Maker</option>
                          <option value="Checker">Checker</option>
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CFormLabel htmlFor="screenCode">Screen</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="screenCode"
                          value={filters.screenCode}
                          onChange={handleFilterChange}
                          placeholder="screenCode filter"
                        >
                          <option value="">Select Screen</option>
                          <option value="TEMPLATECREATE">Fee Template</option>
                          <option value="MDRCREATE">MDR Rates</option>
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CFormLabel htmlFor="role">Status</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="status"
                          value={filters.status}
                          onChange={handleFilterChange}
                          placeholder="Status filter"
                        >
                          <option value="">Select Status</option>
                          <option value="Pending">Pending</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Review">In Review</option>
                        </CFormSelect>
                      </CInputGroup>
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
                        onClick={() => {
                          setPagination((prevPagination) => ({ ...prevPagination, pageNo: 1 }))
                          handleSearch()
                        }}
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
            <div className='tableBorder'>
            <CSmartTable
              tableBodyProps={{ className: 'align-middle' }}
              sorterValue={{ column: 'createdDate', state: 'desc' }}
              tableProps={{ striped: true, hover: true, className: 'custom-table' }}
              items={list}
              columns={columns}
              itemsPerPage={pagination.limit}
              itemsPerPageSelect
              itemsNumber={totalElements}
              pagination={{ external: true }}
              paginationProps={{
                activePage: pagination.pageNo,
                pages:
                  totalElements > 0
                    ? Math.ceil(totalElements / pagination.limit) < pagination.pageNo
                      ? pagination.pageNo
                      : Math.ceil(totalElements / pagination.limit)
                    : 1,
              }}
              onActivePageChange={(page) => {
                const pageNo = page ? page : 0
                setPagination((prevPagination) => ({ ...prevPagination, pageNo }))
              }}
              onItemsPerPageChange={(pageSize) => {
                setPagination((prevPagination) => ({ ...prevPagination, limit: pageSize }))
              }}
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
                status: (item: { status: string }) => (
                  <td>
                    {(() => {
                      if (item.status.toLocaleLowerCase() == TaskStatus.Pending) {
                        return <CBadge color="warning pendingStatus">{item.status}</CBadge>
                      } else if ((item.status as string).toLocaleLowerCase() == TaskStatus.Review) {
                        return <CBadge color="success reviewStatus">{(item.status as string).toLocaleLowerCase() == 'review' ? 'In Review' : ''}</CBadge>
                      } else if (item.status.toLocaleLowerCase() == TaskStatus.Approved) {
                        return <CBadge color="success successStatus">{item.status}</CBadge>
                      } else if (item.status.toLocaleLowerCase() == TaskStatus.Cancelled) {
                        return <CBadge color="success cancelledStatus">{item.status}</CBadge>
                      } 
                      else {
                        return <CBadge color="danger failedStatus">{item.status}</CBadge>
                      }
                    })()}
                  </td>
                ),
                screenCode: (item: { screenCode: string }) => (
                  <td>
                    {(() => {
                      if (item.screenCode == 'MDRCREATE') {
                        return <CBadge color="secondary otherStatus">MDR Rates</CBadge>
                      } else if (item.screenCode == 'TEMPLATECREATE') {
                        return <CBadge color="secondary otherStatus">Fee Template</CBadge>
                      } else if (item.screenCode == 'OPC') {
                        return <CBadge color="secondary otherStatus">Operator Config</CBadge>
                      }
                    })()}
                  </td>
                ),
                maker_checker: (item: { makerEmail: string; checkerEmail: string }) => (
                  <td className="text-center py-2">
                    <div className="d-flex justify-content-center align-items-center gap-2 text-dark">
                      <span className="fw-semibold">{item.makerEmail}</span>
                      <span className="text-secondary small">/</span>
                      <span className="fw-semibold">{item.checkerEmail ?? '-'}</span>
                    </div>
                  </td>
                ),
                makerEmail: (item: { makerEmail: string; checkerEmail: string }) => (
                  <td className="text-center py-2">
                    <div className="d-flex justify-content-center align-items-center gap-2 text-dark">
                      <span className="fw-semibold">{item.makerEmail}</span>
                    </div>
                  </td>
                ),
                checkerEmail: (item: { makerEmail: string; checkerEmail: string }) => (
                  <td className="text-center py-2">
                    <div className="d-flex justify-content-center align-items-center gap-2 text-dark">
                      <span className="fw-semibold">{item.checkerEmail ?? '—'}</span>
                    </div>
                  </td>
                ),

                createdDate: (item: { createdDate: string }) => (
                  <td>{CommonUtil.formatDate(item.createdDate, 'short')}</td>
                ),
                updateDate: (item: { updateDate: string }) => (
                  <td>{CommonUtil.formatDate(item.updateDate, 'short')}</td>
                ),
              }}
              clickableRows
              onRowClick={(item: any) => handleEdit(item)}
            />
            </div>
          </CCardBody>
        </CRow>
      </CCol>
      <ToastNotification />
    </CRow>
  )
}

export default TaskManagement
