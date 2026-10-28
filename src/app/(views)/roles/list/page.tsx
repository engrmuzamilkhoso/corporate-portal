'use client'
import ExportDropdownComponent from '@/components/ExportDropdownComponent'
import Loader from '@/components/loader'
import { selectUserAuth, useTypedSelector } from '@/store'
import { api } from '@/utils/axios'
import { generateCSV, generatePDF, getCSVDownloadLink } from '@/utils/export'
import { PDFTableColumn } from '@/utils/pdf'
import { cibAuth0, cibExpertsExchange, cilFile, cilSearch, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
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
  CModal,
  CModalBody,
  CRow,
  CSmartTable,
} from '@coreui/react-pro'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
interface Role {
  id: string
  role: string
  isCorporate: boolean
  numberOfPrivileges: number
  privileges: { id: string; name: string }[] // Update privileges to include name
}

const RoleList = () => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null) // Ref to access the input value
  const user = useTypedSelector(selectUserAuth)

  const [currentItems, setCurrentItems] = useState<Role[]>([])
  const [loader, setLoader] = useState(true)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [searchText, setSearchText] = useState('')
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
      const response = await api.post('/role/all')
      setCurrentItems(response.data.map((item: any) => ({
        ...item,
        numberOfPrivileges: item.privileges.length,
      })))
      setLoader(false)
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
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

  const csvContent = currentItems
    .map((item) => {
      const privilegesNames = item.privileges.map((privilege) => privilege.name).join('; ') // Join privilege names with a separator
      return [
        item.id,
        item.role,
        item.isCorporate,
        item.numberOfPrivileges,
        privilegesNames, // Add privilege names to the CSV
      ].join(',')
    })
    .join('\n')

  const csvCode = getCSVDownloadLink(currentItems)

  const columns = [
    { key: 'role', label: 'Role', _style: { width: '20%' } },
    { key: 'numberOfPrivileges', label: 'Privileges' }, // Updated label
  ]

  const handleEdit = (role: Role) => {
    const privileges = role.privileges.map((privilege) => privilege.id)
    const queryParams = new URLSearchParams({
      id: role.id,
      role: role.role,
      isCorporate: role.isCorporate.toString(),
      privileges: JSON.stringify(privileges), // Pass only IDs or other serializable data
    }).toString()
    return queryParams
  }

  const handleDelete = (role: Role) => {
    setSelectedRole(role)
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    try {
      // Add logic to delete the user via API
      console.log('Role deleted:', selectedRole?.id)
      setDeleteModalVisible(false)
    } catch (error) {
      console.error('Error deleting role:', error)
    }
  }

  const pdfcolumns: PDFTableColumn[] = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Role', dataKey: 'role' },
    { header: 'Is Corporate', dataKey: 'isCorporate' },
    // { header: 'Number of Privileges', dataKey: 'numberOfPrivileges' },
    { header: 'Privileges', dataKey: 'privileges' },
  ]

  const handleDownloadPDF = () => {
    const currentItemsChanged = currentItems.map((item) => ({
      ...item,
      numberOfPrivileges: item.privileges.length,
      privileges: item.privileges.map((privilege: any) => privilege.name).join(', '),
    }))

    generatePDF('Role List', pdfcolumns, currentItemsChanged, 'role_list')
  }
  const handleDownloadCSV = () => {
    const currentItemsChanged = currentItems.map((item) => ({
      ...item,
      numberOfPrivileges: item.privileges.length,
      privileges: item.privileges.map((privilege: any) => privilege.name).join(', '),
    }))

    generateCSV('Role List', pdfcolumns, currentItemsChanged)
  }
  function getSearchRow() {
    if (inputRef.current) {
      setSearchText(inputRef.current.value) // Update state with the input value
    }
    // const filteredItems = currentItems
    //   .filter((item: any) => item.role.toLowerCase().includes(searchText.toLowerCase()))
    //   .map((item) => ({
    //     ...item,
    //     numberOfPrivileges: item.privileges.length,
    //   }))
    // setCurrentItems(filteredItems)
    // return filteredItems
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
                  <h4>Roles List</h4>
                </CCol>
              </CRow>
              <CRow>
                <CCol xs={4}>
                  <CInputGroup
                    className={`mb-3 search-list ${searchText ? 'search-list-border' : ''}`}
                  >
                    <CFormInput
                      className="search-input"
                      placeholder="Search by role"
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
                  <Link href="/roles/create" passHref>
                    <CButton className="btnCustom" color="primary" size="sm">
                      <CIcon icon={cibAuth0} size="sm" /> Create Role
                    </CButton>
                  </Link>

                  <ExportDropdownComponent
                    onPDFExport={handleDownloadPDF}
                    onCSVExport={handleDownloadCSV}
                  />
                </CCol>
              </CRow>
              <CRow className="p-2">
                <CCol className="" xs={12}>
                <div className='tableBorder'>
                  <CSmartTable
                    clickableRows
                    tableBodyProps={{ className: 'align-middle' }}
                    sorterValue={{ column: 'role', state: 'asc' }}
                    tableProps={{ striped: true, hover: true, className: 'custom-table' }}
                    pagination
                    items={currentItems
                      .filter((item: any) =>
                        item.role.toLowerCase().includes(searchText.toLowerCase()),
                      )
                      .map((item) => ({
                        ...item,
                        numberOfPrivileges: item.privileges.length,
                      }))}
                    columns={columns}
                    itemsPerPage={100}
                    onRowClick={(item: any) => {
                      const queryItems = handleEdit(item)
                      router.push(`/roles/edit?${queryItems}`)
                    }}
                    scopedColumns={{
                      numberOfPrivileges: (item: Role) => (
                        <td>
                          {item.privileges && item.privileges.length > 0 ? (
                            <div>
                              {item.privileges.map((privilege) => (
                                <span key={privilege.id} className="badge bg-info-gradient me-1">
                                  {privilege.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span>No Privileges</span>
                          )}
                        </td>
                      ),
                    }}
                  />
                  </div>
                </CCol>
              </CRow>
            </CCardBody>
          </CRow>
        </CCol>
      </CRow>

      {/* Delete Confirmation Modal */}
      <CModal
        visible={deleteModalVisible}
        alignment="center"
        onClose={() => setDeleteModalVisible(false)}
      >
        <CModalBody>
          <CRow className="justify-content-center mb-3 delete-icon">
            <CIcon icon={cilTrash} size="7xl" />
          </CRow>

          <CRow className="c-height"></CRow>
          <p className="delete-ask">Are you sure you want to delete this user?</p>
          <CRow>
            <CCol xs={6} className="d-grid mb-3">
              <CButton color="primary" onClick={() => setDeleteModalVisible(false)}>
                Cancel
              </CButton>
            </CCol>
            <CCol xs={6} className="d-grid mb-3">
              <CButton color="danger" onClick={confirmDelete}>
                Delete
              </CButton>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>
    </>
  )
}

export default RoleList
