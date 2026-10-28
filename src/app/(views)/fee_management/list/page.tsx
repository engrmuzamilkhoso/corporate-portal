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
import { cilPencil, cilSearch, cilShortText, cilX } from '@coreui/icons'
import { CIcon } from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCardBody,
  CCol,
  CFormInput,
  CFormSelect,
  CImage,
  CInputGroup,
  CInputGroupText,
  CMultiSelect,
  CRow,
  CSmartTable,
} from '@coreui/react-pro'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const FeeTemplate = () => {
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
  const [showFilter, setShowFilter] = useState(false)
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [makerId, setMakerId] = useState('')

  const handleInputChange = (e: any) => {
    setSearchText(e.target.value)
  }

  const clearSearch = () => {
    setSearchText('')
    handleSearch()
  }

  const searchRows = () => {
    const filteredTemplates = list.filter((item) =>
      item.templateName.toLowerCase().includes(searchText.toLowerCase()),
    )
    setList(filteredTemplates)
  }

  const columns = [
    { key: 'templateName', label: 'Template Name', _style: { width: '15%' } },
    { key: 'feeType', label: 'Fee Type', _style: { width: '10%' } },
    { key: 'product', label: 'Product', _style: { width: '10%' }, sorter: true },
    { key: 'displayName', label: 'Display Name', _style: { width: '10%' } },
    { key: 'makerCheckerStatus', label: 'Status', _style: { width: '10%' } },
    { key: 'createdDate', label: 'Created at', _style: { width: '15%' }, sorter: true },
    { key: 'updateDate', label: 'Updated at', _style: { width: '15%' } },
    { key: 'actions', label: 'Actions', _style: { width: '10%' } },
  ]
  const pdfcolumns: PDFTableColumn[] = [
    { header: 'Template Name', dataKey: 'templateName' },
    { header: 'Fee Type', dataKey: 'feeType' },
    { header: 'Product', dataKey: 'product' },
    { header: 'Display Name', dataKey: 'displayName' },
    { header: 'Status', dataKey: 'makerCheckerStatus' },
    { header: 'Created At', dataKey: 'createdDate' },
    { header: 'Updated At', dataKey: 'updateDate' },
  ]
  const handleDownloadPDF = () => {
    generatePDF('Fee Template List', pdfcolumns, list, 'fee_template_list')
  }
  const handleDownloadCSV = () => {
    generateCSV('Fee Template List', pdfcolumns, list)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFilters({
      ...filters,
      [id]: value,
    })
  }

  const buildQueryParams = () => {
    let queryParams: { [key: string]: string } = {}
    if (filters.search) queryParams.search = filters.search
    if (screen && screen !== '') queryParams.pageCode = screen
    if (filters.role !== 'all') queryParams.role = filters.role
    if (filters.status !== 'all') queryParams.status = filters.status
    return queryParams
  }

  const handleSearch = async () => {
    setLoader(true)
    setShowFilter(false)

    try {
      let makerId = null
      const makerCheckerResponse = await api
        .post('corporate/makerCheckerRole/list', {
          search: userAuth.email,
          pageCode: 'TEMPLATECREATE',
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

      const response = await api.post(
        `corporate/feesTemplate/list?makerId=${makerId}&getAll=${
          (userAuth.role as string).toLowerCase() === 'corpadmin' ||
          (userAuth.role as string).toLowerCase() === 'admin'
        }`,
      )

      if (response.data.status == '0000') {
        setList(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching list:', error)
    } finally {
      setLoader(false)
    }
  }

  const csvCode = getCSVDownloadLink(list)
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

  function handleEdit(id: string) {
    router.push(`/fee_management/update?id=${id}`)
  }

  function deactivateTemplate(id: string) {
    router.push(`/fee_management/deactivate-template?id=${id}`)
  }

  const toggleFilter = () => {
    alert('under development')
    //setShowFilter(!showFilter)
  }

  return (
    <CRow>
      <Loader isLoading={loader} />
      <CCol xs={12}>
        <CRow className="px-5">
          <CCardBody>
            <CRow>
              <CCol className="mb-3" xs={12}>
                <h4>Fee Template List</h4>
              </CCol>
            </CRow>
            <CRow>
              <CRow>
                <CCol xs={4}>
                  <CInputGroup
                    className={`mb-3 search-list ${searchText ? 'search-list-border' : ''}`}
                  >
                    <CFormInput
                      className="search-input"
                      placeholder="Search By Template Name"
                      aria-label="Search"
                      aria-describedby="Search1"
                      value={searchText}
                      onChange={handleInputChange}
                    />

                    <CInputGroupText className="clear-search">
                      {searchText && (
                        <Link href="#" onClick={clearSearch}>
                          Clear
                        </Link>
                      )}
                    </CInputGroupText>

                    <CInputGroupText className="search-icon" id="Search1">
                      <CIcon icon={cilSearch} onClick={searchRows} />
                    </CInputGroupText>
                  </CInputGroup>
                </CCol>
                <CCol className="text-end" xs={8}>
                  <Link href="/fee_management/create">
                    <CButton className="btnCustom" color="primary" size="sm">
                      <CIcon icon={cilShortText} size="sm" /> Create New Template
                    </CButton>
                  </Link>
                  {/* <CButton onClick={toggleFilter} color="light" className="filter-btn" size="sm">
                    <CIcon icon={cilFilter} size="sm" /> Filter
                  </CButton> */}

                  <ExportDropdownComponent
                    onPDFExport={handleDownloadPDF}
                    onCSVExport={handleDownloadCSV}
                  />
                </CCol>
              </CRow>
            </CRow>
            {showFilter && (
              <CRow className="filter-overlay">
                <CCol xs={12} className="filter-overlay-content">
                  <CRow>
                    <CCol md={3}>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          id="search"
                          placeholder="Search by Name or Email"
                          value={filters.search}
                          onChange={handleFilterChange}
                        />
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CInputGroup className="has-validation">
                        <CMultiSelect
                          placeholder="Select Screen"
                          multiple={false}
                          onChange={(choice) => {
                            //@ts-ignore
                            setScreen(choice[0].value)
                          }}
                          options={privileges}
                          optionsStyle="text"
                          resetSelectionOnOptionsChange
                          required
                        />
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="role"
                          value={filters.role}
                          onChange={handleFilterChange}
                          placeholder="Role Filter"
                        >
                          <option value="all">All</option>
                          <option value="Maker">Maker</option>
                          <option value="Checker">Checker</option>
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="status"
                          value={filters.status}
                          onChange={handleFilterChange}
                          placeholder="Status filter"
                        >
                          <option value="all">All</option>
                          <option value="true">Activated</option>
                          <option value="false">Deactivated</option>
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>
                  </CRow>
                  <CRow className="p-2">
                    <CCol xs={8}></CCol>

                    <CCol className="text-end" xs={4}>
                      <CButton
                        onClick={toggleFilter}
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
                items={list}
                columns={columns}
                itemsPerPage={10}
                pagination
                scopedColumns={{
                  templateName: (item: { templateName: string }) => <td>{item.templateName}</td>,
                  makerCheckerStatus: (item: { makerCheckerStatus: string }) => (
                    <td>
                      {(() => {
                        if (item.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Pending) {
                          return (
                            <CBadge color="warning pendingStatus">{item.makerCheckerStatus}</CBadge>
                          )
                        } else if (
                          item.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Review
                        ) {
                          return (
                            <CBadge color="success reviewStatus">
                              {' '}
                              {item.makerCheckerStatus == 'Review' ? 'In Review' : ''}
                            </CBadge>
                          )
                        } else if (
                          item.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Approved
                        ) {
                          return (
                            <CBadge color="success successStatus">{item.makerCheckerStatus}</CBadge>
                          )
                        } else {
                          return (
                            <CBadge color="danger failedStatus">{item.makerCheckerStatus}</CBadge>
                          )
                        }
                      })()}
                    </td>
                  ),
                  createdDate: (item: { createdDate: string }) => (
                    <td>{CommonUtil.formatDate(item.createdDate, 'short')}</td>
                  ),
                  updateDate: (item: { updateDate: string }) => (
                    <td>{CommonUtil.formatDate(item.updateDate, 'short')}</td>
                  ),
                  actions: (item: { makerCheckerStatus: string; id: string; makerId: string }) => (
                    <td>
                      <CButton
                        className="tableIcon"
                        size="sm"
                        title="View Template"
                        onClick={() => {
                          handleEdit(item.id)
                        }}
                      >
                        <i className="bi bi-eye"></i>
                        {/* <CIcon icon={cilZoom} size="sm" /> */}
                      </CButton>
                      {item.makerCheckerStatus === 'Approved' &&
                        (item.makerId === makerId ||
                          (userAuth.role.toLowerCase() !== 'admin' &&
                            userAuth.role.toLowerCase() !== 'corpadmin')) && (
                          <CButton
                            className="tableIcon"
                            variant="outline"
                            size="sm"
                            title="Deactivate Template"
                            onClick={() => {
                              deactivateTemplate(item.id)
                            }}
                          >
                            <CIcon className="tableIcon" icon={cilPencil} size="sm" />
                          </CButton>
                        )}
                    </td>
                  ),
                }}
                // clickableRows
                // onRowClick={(item: any) => deactivateTemplate(item)}
              />
            </div>
          </CCardBody>
        </CRow>
      </CCol>
      <ToastNotification />
    </CRow>
  )
}

export default FeeTemplate
