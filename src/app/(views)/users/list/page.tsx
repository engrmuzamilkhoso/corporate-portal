'use client'
import ExportDropdownComponent from '@/components/ExportDropdownComponent'
import Loader from '@/components/loader'
import { selectUserAuth, useTypedSelector } from '@/store'
import { api } from '@/utils/axios'
import { generateCSV, generatePDF, getCSVDownloadLink } from '@/utils/export'
import { cibExpertsExchange, cilFile, cilSearch } from '@coreui/icons'
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
  CInputGroup,
  CInputGroupText,
  CRow,
  CSmartTable,
} from '@coreui/react-pro'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const UserList = () => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null) // Ref to access the input value
  const [currentItems, setCurrentItems] = useState([])
  const [loader, setLoader] = useState(true)
  const [showFilter, setShowFilter] = useState(false)
  const [searchText, setSearchText] = useState('')

  const userAuth = useTypedSelector(selectUserAuth)

  const handleInputChange = (e: any) => {
    console.log(e.target.value)
    setSearchText(e.target.value)
  }

  const clearSearch = () => {
    setSearchText('')

    if (inputRef.current) {
      inputRef.current.value = '' // Clear the input field
    }
    fetchUsers()
  }

  const fetchUsers = async () => {
    try {
      const isRoleAdmin = (userAuth.role as string).toLowerCase() === 'corpadmin' || (userAuth.role as string).toLowerCase() === 'admin'
      setLoader(true)
      const response = await api.post('user/v2/all', {
        isCorporate: true,
        orderBy: 'firstName',
        direction: 'asc',
        pageNo: 0,
        limit: 40,
        email: isRoleAdmin ? undefined : userAuth.email,
      })
      setCurrentItems(response.data.content)
      setLoader(false)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }
  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const element = document.querySelector('.tableBorder > div:nth-child(2)');
    if (element) {
      element.classList.add('card');
    }
  }, []);

  const pdfcolumns: any = [
    { header: 'First Name', dataKey: 'firstName' },
    { header: 'Last Name', dataKey: 'lastName' },
    { header: 'Email', dataKey: 'email' },
    { header: 'Role', dataKey: 'roles' },
  ]

  const csvCode = getCSVDownloadLink(currentItems)

  const handleDownloadCSV = () => {
    generateCSV(
      'Users List',
      pdfcolumns,
      currentItems
        .filter((user: any) => user.roles && user.roles.length > 0 && user.roles[0])
        .map((user: any) => {
          return { ...user, roles: (user.roles[0].role as string).toUpperCase() }
        }),
    )
  }

  const handleDownloadPDF = () => {
    generatePDF(
      'Users List',
      pdfcolumns,
      currentItems
        .filter((user: any) => user.roles && user.roles.length > 0 && user.roles[0])
        .map((user: any) => {
          return { ...user, roles: (user.roles[0].role as string).toUpperCase() }
        }),
      'users_list',
    )
  }

  const handleEdit = (user: any) => {
    const encodedEmail = encodeURIComponent(user.email);
    router.push(`/users/edit/?email=${encodedEmail}`);
  }

  const columns = [
    { key: 'firstName', label: 'First Name', _style: { width: '15%' } },
    { key: 'lastName', label: 'Last Name', _style: { width: '15%' } },
    { key: 'email', label: 'Email', _style: { width: '15%' } },
    { key: 'roles', label: 'Roles', _style: { width: '10%' }, sorter: false },
    { key: 'enabled', label: 'Status', _style: { width: '7%' } },
    { key: 'actions', label: 'Actions', _style: { width: '5%' } },
  ]
  const toggleFilter = () => {
    alert('under development')
  }

  function getSearchRow() {
    if (inputRef.current) {
      setSearchText(inputRef.current.value) // Update state with the input value
    }
    // const filteredItems = currentItems.filter((item: any) =>
    //   item.email.toLowerCase().includes(searchText.toLowerCase()),
    // )
    // setCurrentItems(filteredItems)
  }

  return (
    <>
      <CRow>
        <Loader isLoading={loader} />
        <CCol xs={12}>
          <CRow className="px-5">
            <CCardBody>
              <CRow>
                <CCol className="mb-3" xs={12}>
                  <h4>Users List</h4>
                </CCol>
              </CRow>
              <CRow>
                <CCol xs={4}>
                  <CInputGroup
                    className={`mb-3 search-list ${searchText ? 'search-list-border' : ''}`}
                  >
                    <CFormInput
                      className="search-input"
                      placeholder="Search by email"
                      aria-label="Search"
                      aria-describedby="Search1"
                      ref={inputRef}
                    />

                    <CInputGroupText className="clear-search">
                      {searchText && (
                        <Link href="#" onClick={clearSearch}>
                          Clear
                        </Link>
                      )}
                    </CInputGroupText>

                    <CInputGroupText
                      className="search-icon"
                      id="Search1"
                      onClick={() => getSearchRow()}
                    >
                      <CIcon icon={cilSearch} />
                    </CInputGroupText>
                  </CInputGroup>
                </CCol>
                <CCol className="text-end" xs={8}>
                  <Link href="/users/create" passHref>
                    <CButton className="btnCustom" color="primary" size="sm">
                      <i className="bi bi-person-add"></i> Create User
                    </CButton>
                  </Link>

                  <ExportDropdownComponent
                    onPDFExport={handleDownloadPDF}
                    onCSVExport={handleDownloadCSV}
                  />
                </CCol>
              </CRow>

              <div className='tableBorder'>
              <CSmartTable
                tableFilterValue={searchText}
                sorterValue={{ column: 'firstName', state: 'asc' }}
                // clickableRows
                tableProps={{
                  striped: true,
                  hover: true,
                  className: 'custom-table',
                }}
                items={currentItems.filter((item: any) =>
                  item.email.toLowerCase().includes(searchText.toLowerCase()),
                )}
                columns={columns}
                itemsPerPageSelect
                columnSorter
                pagination
                onRowClick={(item: any) => handleEdit(item)}
                scopedColumns={{
                  roles: (item: any) => (
                    <td>
                      {item.roles && item.roles.length > 0 ? (
                        item.roles.map((role: any, index: any) =>
                          role ? (
                            <CBadge
                              color="primary"
                              key={role.id}
                              className="badge bg-info-gradient me-1"
                            >
                              {role.role.charAt(0).toUpperCase() + role.role.slice(1).toLowerCase()}
                            </CBadge>
                          ) : (
                            <span key={index}>Role not found</span>
                          ),
                        )
                      ) : (
                        <span>No roles assigned</span>
                      )}
                    </td>
                  ),
                  enabled: (item: any) => (
                    <td>
                      {item.enabled ? (
                        <CBadge color="success successStatus">Active</CBadge>
                      ) : (
                        <CBadge color="danger failedStatus">Inactive</CBadge>
                      )}
                    </td>
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
                      </CButton>
                    </td>
                  ),
                }}
              />
              </div>
          
            </CCardBody>
          </CRow>
        </CCol>
      </CRow>
    </>
  )
}

export default UserList
