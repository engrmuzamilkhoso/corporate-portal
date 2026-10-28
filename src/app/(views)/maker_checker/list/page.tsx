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
import {
  cibExpertsExchange,
  cilClearAll,
  cilFile,
  cilFilter,
  cilSearch,
  cilUserPlus,
  cilX,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCardBody,
  CCol,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CFormInput,
  CFormSelect,
  CInputGroup,
  CMultiSelect,
  CRow,
  CSmartTable,
} from '@coreui/react-pro'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const MakerChecker = () => {
  const { showToast } = useToastNotification()
  const [filters, setFilters] = useState({
    search: '',
    screen: '',
    role: '',
    status: '',
  })
  const [loader, setLoader] = useState(false)
  const [privileges, setPrivileges] = useState([])
  const [screen, setScreen] = useState<string>()
  const [list, setList] = useState<any[]>([])
  const [showFilter, setShowFilter] = useState(false)
  const router = useRouter()

  const userAuth = useTypedSelector(selectUserAuth)
  const [isRoleAdmin, setIsRoleAdmin] = useState<Boolean>(false)

  const columns = [
    { key: 'name', label: 'Name', _style: { width: '15%' } },
    { key: 'pageCode', label: 'Page Code', _style: { width: '15%' } },
    { key: 'role', label: 'Role', _style: { width: '10%' }, sorter: true },
    { key: 'status', label: 'Status', _style: { width: '10%' } },
    { key: 'createdDate', label: 'Created at', _style: { width: '15%' } },
    { key: 'updateDate', label: 'Updated at', _style: { width: '15%' } },
    { key: 'actions', label: 'Actions', _style: { width: '10%' } },
  ]
  const csvContent = list
    .map((item: any) =>
      [
        item.userDetail.firstName, // Include firstName
        item.pageCode,
        item.role,
        item.status,
        item.createdDate,
        item.updateDate,
      ].join(','),
    )
    .join('\n')

  // const csvCode = 'data:text/csv;charset=utf-8,SEP=,%0A' + encodeURIComponent(csvContent)

  const csvCode = getCSVDownloadLink(list)

  const pdfcolumns: PDFTableColumn[] = [
    { header: 'Name', dataKey: 'name' },
    { header: 'Page Code', dataKey: 'pageCode' },
    { header: 'Role', dataKey: 'role' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Created At', dataKey: 'createdDate' },
    { header: 'Updated At', dataKey: 'updateDate' },
  ]

  const handleDownloadPDF = () => {
    generatePDF(
      'Assigned Role List',
      pdfcolumns,
      list.map((item: any) => ({
        name: `${item.userDetail.firstName} ${item.userDetail.lastName}`, // Extract firstName
        pageCode: item.pageCode,
        role: item.role,
        status: item.status,
        createdDate: item.createdDate,
        updateDate: item.updateDate,
      })),
      'assigned_role_list',
    )
  }
  const handleDownloadCSV = () => {
    generateCSV(
      'Assigned Role List',
      pdfcolumns,
      list.map((item: any) => ({
        name: `${item.userDetail.firstName} ${item.userDetail.lastName}`, // Extract firstName
        pageCode: item.pageCode,
        role: item.role,
        status: item.status,
        createdDate: item.createdDate,
        updateDate: item.updateDate,
      })),
    )
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
    if (filters.role !== '') queryParams.role = filters.role
    if (filters.status !== '') queryParams.status = filters.status
    return queryParams
  }

  const handleSearch = async () => {
    setLoader(true)
    //  setShowFilter(false)
    const queryParams = buildQueryParams()
    if (
      (userAuth.role as string).toLowerCase() === 'corpadmin' ||
      (userAuth.role as string).toLowerCase() === 'admin'
    ) {
      queryParams.search = filters.search
    } else {
      queryParams.search = userAuth.email
    }
    console.log(queryParams)
    try {
      await api
        .post('corporate/makerCheckerRole/list', { ...queryParams, limit: 100, direction: 'desc' })
        .then((response) => {
          console.log(response.data)
          setList(response.data.content)
          setLoader(false)
        })
    } catch (error) {
      console.error('Error fetching roles:', error)
    }
  }
  const clearFilters = () => {
    if (
      (userAuth.role as string).toLowerCase() === 'corpadmin' ||
      (userAuth.role as string).toLowerCase() === 'admin'
    ) {
      setFilters({
        search: '',
        screen: '',
        role: '',
        status: '',
      })
    } else {
      setFilters({
        search: userAuth.email,
        screen: '',
        role: '',
        status: '',
      })
    }
    setScreen('')
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
    setIsRoleAdmin(
      (userAuth.role as string).toLowerCase() === 'corpadmin' ||
        (userAuth.role as string).toLowerCase() === 'admin',
    )
    if (userAuth.role.toLowerCase() !== 'admin' && userAuth.role.toLowerCase() !== 'corpadmin') {
      setFilters({ ...filters, search: userAuth.email })
    }
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
    router.push(
      `/maker_checker/update?userId=${item.userDetail.userID}&pageCode=${item.pageCode}&role=${item.role}&status=${item.status}&id=${item.id}`,
    )
  }

  const toggleFilter = (param: any) => {
    if (param == true) {
      setShowFilter(param)
    } else {
      setShowFilter(param)
      if (
        (userAuth.role as string).toLowerCase() === 'corpadmin' ||
        (userAuth.role as string).toLowerCase() === 'admin'
      ) {
        alert()
        setFilters({
          search: '',
          screen: '',
          role: '',
          status: '',
        })
      } else {
        setFilters({
          search: userAuth.email,
          screen: '',
          role: '',
          status: '',
        })
      }
      handleSearch()
    }
  }

  return (
    <CRow>
      <Loader isLoading={loader} />
      <CCol xs={12}>
        <CRow className="px-5">
          <CCardBody>
            <CRow className="">
              <CCol xs={4}>
                <h4>Maker Checker List</h4>
              </CCol>
              <CCol className="text-end" xs={8}>
                <Link href="/maker_checker/assign">
                  <CButton className="btnCustom" color="primary" size="sm">
                    <CIcon icon={cilUserPlus} size="sm" /> Assign Role
                  </CButton>
                </Link>
                <CButton
                  onClick={() => {
                    toggleFilter(true)
                  }}
                  color="light"
                  className="filter-btn ms-2"
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
            {showFilter && (
              <CRow className="filter-overlay">
                <CCol xs={12} className="filter-overlay-content">
                  <CRow>
                    {(userAuth.role as string).toLowerCase() === 'corpadmin' ||
                      ((userAuth.role as string).toLowerCase() === 'admin' && (
                        <CCol md={3}>
                          <CInputGroup className="has-validation">
                            <CFormInput
                              id="search"
                              placeholder="Search by Name or Email"
                              value={filters.search}
                              onChange={handleFilterChange}
                              disabled={!isRoleAdmin}
                            />
                          </CInputGroup>
                        </CCol>
                      ))}

                    <CCol
                      md={
                        (userAuth.role as string).toLowerCase() === 'corpadmin' ||
                        (userAuth.role as string).toLowerCase() === 'admin'
                          ? 3
                          : 4
                      }
                    >
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
                          cleaner={false}
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol
                      md={
                        (userAuth.role as string).toLowerCase() === 'corpadmin' ||
                        (userAuth.role as string).toLowerCase() === 'admin'
                          ? 3
                          : 4
                      }
                    >
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="role"
                          value={filters.role}
                          onChange={handleFilterChange}
                          placeholder="Role Filter"
                        >
                          <option value="">All</option>
                          <option value="Maker">Maker</option>
                          <option value="Checker">Checker</option>
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>
                    <CCol
                      md={
                        (userAuth.role as string).toLowerCase() === 'corpadmin' ||
                        (userAuth.role as string).toLowerCase() === 'admin'
                          ? 3
                          : 4
                      }
                    >
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="status"
                          value={filters.status}
                          onChange={handleFilterChange}
                          placeholder="Status filter"
                        >
                          <option value="">All</option>
                          <option value="true">Activated</option>
                          <option value="false">Deactivated</option>
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
                        <CIcon icon={cilClearAll} className="sm"></CIcon> Clear
                      </CButton>
                      <CButton
                        onClick={() => {
                          toggleFilter(false)
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
                sorterValue={{ column: 'role', state: 'asc' }}
                tableProps={{ striped: true, hover: true, className: 'custom-table' }}
                items={list}
                columns={columns}
                itemsPerPageSelect
                itemsPerPage={10}
                pagination
                scopedColumns={{
                  name: (item: { userDetail: { firstName: string; lastName: string } }) => (
                    <td>
                      {item.userDetail.firstName} {item.userDetail.lastName}
                    </td>
                  ),
                  status: (item: { status: string }) => (
                    <td>
                      <CBadge color={item.status ? 'success successStatus' : 'danger failedStatus'}>
                        {item.status ? 'Activated' : 'Deactivated'}
                      </CBadge>
                    </td>
                  ),
                  createdDate: (item: { createdDate: string }) => (
                    <td>{CommonUtil.formatDate(item.createdDate, 'short')}</td>
                  ),
                  updateDate: (item: { updateDate: string }) => (
                    <td>{CommonUtil.formatDate(item.updateDate, 'short')}</td>
                  ),
                  actions: (item: any) => (
                    <td>
                      <CButton
                        className="tableIcon"
                        size="sm"
                        title="View Template"
                        onClick={() => {
                          handleEdit(item)
                        }}
                      >
                        <i className="bi bi-eye"></i>
                        {/* <CIcon icon={cilZoom} size="sm" /> */}
                      </CButton>
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

export default MakerChecker
