'use client'

import AccessDeniedComponent from '@/components/AccessDeniedComponent'
import DisabledComponent from '@/components/DisabledComponent'
import ExportDropdownComponent from '@/components/ExportDropdownComponent'
import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import { api } from '@/utils/axios'
import { CommonUtil } from '@/utils/common'
import { generateCSV } from '@/utils/export'
import { PDFGenerator, PDFTableColumn } from '@/utils/pdf'
import { TaskStatus } from '@/utils/status.enum'
import {
  cibExpertsExchange,
  cilFile,
  cilSearch,
  cilX
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
  CInputGroupText,
  CMultiSelect,
  CRow,
  CSmartTable
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
  const [roleData, setRoleData] = useState<{ role?: string; disabled?: boolean }>({})
  const router = useRouter()
  const [searchText, setSearchText] = useState('')

  const handleInputChange = (e: any) => {
    console.log(e.target.value)
    setSearchText(e.target.value)
  }

  const clearSearch = () => {
    setSearchText('')
    handleSearch()
  }
  function getSearchRow() {
    const filteredItems = list.filter((item: any) =>
      item.templateName.toLowerCase().includes(searchText.toLowerCase()),
    )
    setList(filteredItems)
  }

  const columns = [
    { key: 'templateName', label: 'Title', _style: { width: '15%' } },
    { key: 'role', label: 'Role', _style: { width: '15%' } },
    { key: 'feeType', label: 'Fee Type', _style: { width: '10%' } },
    { key: 'product', label: 'Product', _style: { width: '10%' }, sorter: true },
    { key: 'displayName', label: 'Display Name', _style: { width: '10%' } },
    { key: 'makerCheckerStatus', label: 'Status', _style: { width: '10%' } },
    { key: 'createdDate', label: 'Created at', _style: { width: '20%' }, sorter: true },
    { key: 'updateDate', label: 'Updated at', _style: { width: '20%' } },
  ]
  const pdfcolumns: PDFTableColumn[] = [
    { header: 'Template Name', dataKey: 'templateName' },
    { header: 'FeeT ype', dataKey: 'feeType' },
    { header: 'Product', dataKey: 'product' },
    { header: 'Display Name', dataKey: 'displayName' },
    { header: 'Status', dataKey: 'makerCheckerStatus' },
    { header: 'Created At', dataKey: 'createdDate' },
    { header: 'Updated At', dataKey: 'updateDate' },
  ]
  const handleDownloadPDF = () => {
    const pdfGenerator = new PDFGenerator()
    const dataForPDF = list.map((item: any) => ({
      templateName: item.templateName, // Extract firstName
      feeType: item.feeType,
      product: item.product,
      displayName: item.displayName,
      makerCheckerStatus: item.makerCheckerStatus,
      createdDate: item.createdDate,
      updateDate: item.updateDate,
    }))
    pdfGenerator.generatePDF('Maker Checker List', pdfcolumns, dataForPDF, 'fee_template_list')
  }

    const handleDownloadCSV = () => {
      const pdfGenerator = new PDFGenerator()
    const dataForPDF = list.map((item: any) => ({
      templateName: item.templateName, // Extract firstName
      feeType: item.feeType,
      product: item.product,
      displayName: item.displayName,
      makerCheckerStatus: item.makerCheckerStatus,
      createdDate: item.createdDate,
      updateDate: item.updateDate,
    }))
      generateCSV('Fee Template List', pdfcolumns, dataForPDF)
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

  const csvCode = 'data:text/csv;charset=utf-8,SEP=,%0A' + encodeURIComponent(csvContent)
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
    const queryParams = buildQueryParams()
    try {
      api
        .post('corporate/makerCheckerRole/list', {
          search: userAuth.email,
          pageCode: 'TEMPLATECREATE',
          role: 'Maker',
        })
        .then(async (response: any) => {
          if (response.status == 200) {
            const rights = response.data.content as any[]
            console.log(response)

            if (!rights.length) {
              setRoleData({ role: 'null' })
              return
            }
            if (!rights[0].status) {
              setRoleData({ disabled: true })
              return
            }
            setRoleData({ role: 'maker' })
            const maker = response.data.content[0].id
            if (!maker) {
              setLoader(false)
              throw new Error('Maker dont have any template')
            }

            await api.post('/corporate/feesTemplate/list?makerId=' + maker).then((response) => {
              console.log(': ', response.data)
              if (response.data.status == '0000') {
                setList(response.data.data)
                setLoader(false)
              }
            })
          }
        })
        .catch((error) => {
          setLoader(false)
          console.error('Error fetching list:', error)
        })
        .finally(() => {
          setLoader(false)
        })
    } catch (error) {
      // console.log('Error fetching list:', error)
    } finally {
      setLoader(false)
    }
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
      const element = document.querySelector('.tableBorder > div:nth-child(2)');
      if (element) {
        element.classList.add('card');
      }
    }, []);

  function handleEdit(item: any) {
    router.push(`/maker_checker/maker-task-list/edit?id=${item.id}`)
  }

  const toggleFilter = () => {
    alert('under development')
    //setShowFilter(!showFilter)
  }

  const MakerTemplateList = () => (
    <CCol xs={12}>
      <CRow className="px-5">
        <CCardBody>
          <CRow>
            <CCol className="mb-3" xs={12}>
              <h4>Maker Task List</h4>
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
                    placeholder="Search by template name"
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
                {/*<CButton onClick={toggleFilter} color="light" className="filter-btn" size="sm">*/}
                {/*  <CIcon icon={cilFilter} size="sm" /> Filter*/}
                {/*</CButton>*/}

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
                    <CButton onClick={toggleFilter} color="light" className="filter-btn" size="sm">
                      <CIcon icon={cilX} className="sm"></CIcon> Cancel
                    </CButton>

                    <CButton onClick={handleSearch} color="light" className="filter-btn" size="sm">
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
            itemsPerPage={100}
            pagination
            scopedColumns={{
              templateName: (item: { templateName: string }) => <td>{item.templateName}</td>,
              role: () => <td>Maker</td>,
              makerCheckerStatus: (item: { makerCheckerStatus: string }) => (
                <td>
                  {(() => {
                    if (item.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Pending) {
                      return <CBadge color="warning pendingStatus">{item.makerCheckerStatus}</CBadge>
                    } else if (item.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Approved) {
                      return <CBadge color="success successStatus">{item.makerCheckerStatus}</CBadge>
                    } else {
                      return <CBadge color="danger failedStatus">{item.makerCheckerStatus}</CBadge>
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
            }}
            clickableRows
            onRowClick={(item: any) => handleEdit(item)}
          />
          </div>
        </CCardBody>
      </CRow>
    </CCol>
  )

  const Page = () => {
    if (roleData.role == 'null') {
      return <AccessDeniedComponent role="Maker" />
    } else if (roleData.disabled) {
      return <DisabledComponent />
    } else if(roleData.role == "maker"){
      return <MakerTemplateList />
    }
  }

  return (
    <CRow>
      <Loader isLoading={loader} />
      <Page />
      <ToastNotification />
    </CRow>
  )
}

export default FeeTemplate
