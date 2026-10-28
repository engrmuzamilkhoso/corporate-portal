'use client'

import ExportDropdownComponent from '@/components/ExportDropdownComponent'
import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import { api } from '@/utils/axios'
import { CommonUtil } from '@/utils/common'
import { generateCSV, generatePDF } from '@/utils/export'
import { PDFTableColumn } from '@/utils/pdf'
import { TaskStatus } from '@/utils/status.enum'
import { cilFilter, cilPencil, cilSearch, cilX } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCardBody,
  CCol,
  CFormLabel,
  CFormSelect,
  CInputGroup,
  CRow,
  CSmartTable,
} from '@coreui/react-pro'
import {
  configAccountRoutes,
  configChannels,
  configRegions,
  operatorMapping,
  type ConfigurationDropdownOption,
} from '@/utils/configurationUtils'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const ConfigurationList = () => {
  const { showToast } = useToastNotification()

  const userAuth = useTypedSelector(selectUserAuth)

  const [filters, setFilters] = useState({
    account_route: '',
    channel: '',
    operator: '',
    region: '',
  })
  const [loader, setLoader] = useState(false)
  const [privileges, setPrivileges] = useState([])
  const [list, setList] = useState<any[]>([])
  const [showFilter, setShowFilter] = useState(true)
  const [makerId, setMakerId] = useState<string | null>(null)
  const [operators, setOperators] = useState<ConfigurationDropdownOption[]>([
    { value: '', label: '' },
  ])
  const router = useRouter()

  const columns = [
    { key: 'templateName', label: 'Configuration Title', _style: { width: '20%' } },
    { key: 'channel', label: 'Channel', _style: { width: '10%' } },
    { key: 'account_route', label: 'Account Route', _style: { width: '10%' } },
    { key: 'makerCheckerStatus', label: 'Status', _style: { width: '10%' } },
    { key: 'createdDate', label: 'Created at', _style: { width: '15%' }, sorter: true },
    { key: 'updateDate', label: 'Updated at', _style: { width: '15%' } },
    { key: 'actions', label: 'Actions', _style: { width: '10%' } },
  ]
  const pdfcolumns: PDFTableColumn[] = [
    { dataKey: 'templateName', header: 'Configuration Title' },
    { dataKey: 'channel', header: 'Channel' },
    { dataKey: 'account_route', header: 'Account Route' },
    { dataKey: 'makerCheckerStatus', header: 'Status' },
    { header: 'Created At', dataKey: 'createdDate' },
    { header: 'Updated At', dataKey: 'updateDate' },
  ]

  const handleDownloadPDF = () => {
    generatePDF('Operator Configuration List', pdfcolumns, list, 'op_config_list')
  }

  const handleDownloadCSV = () => {
    generateCSV('Operator Configuration List', pdfcolumns, list)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFilters({
      ...filters,
      [id]: value,
    })
  }

  function updateConfigurationStatus(id: string) {
    router.push(`/settlement/config-status-update?id=${id}`)
  }

  const buildQueryParams = () => {
    let queryParams: { [key: string]: string } = {}
    if (filters.account_route) queryParams.account_route = filters.account_route
    if (filters.channel) queryParams.channel = filters.channel
    if (filters.operator) queryParams.operator = filters.operator
    if (filters.region) queryParams.region = filters.region
    return queryParams
  }
  const clearFilters = async () => {
    setShowFilter(false)
    setFilters({
      account_route: '',
      channel: '',
      operator: '',
      region: '',
    })
    setLoader(true)
    await api
      .post('/corporate/autoReconSettlement/operator-config/list', {
        makerId: makerId ?? null,
        getAll:
          (userAuth.role as string).toLowerCase() === 'corpadmin' ||
          (userAuth.role as string).toLowerCase() === 'admin',
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

  // Load operator options when prerequisites are selected
  useEffect(() => {
    const shouldEnableOperator = Boolean(filters.account_route && filters.channel && filters.region)
    if (!shouldEnableOperator) {
      setOperators([{ value: '', label: '' }])
      setFilters((prev) => ({ ...prev, operator: '' }))
      return
    }

    let operatorsApi = ''
    if (filters.channel === 'Collection') {
      operatorsApi = `/operator/getAllOperatorsTransaction?region=${filters.region}`
    } else if (filters.channel === 'Disbursement') {
      operatorsApi = `/operator/getAllOperator?db=DISB`
    } else if (filters.channel === 'Remittance') {
      operatorsApi = `/operator/getAllOperator?db=REMITTANCE`
    } else {
      setOperators([{ value: '', label: '' }])
      setFilters((prev) => ({ ...prev, operator: '' }))
      return
    }

    api
      .get(operatorsApi)
      .then((response) => {
        setLoader(true)
        operatorMapping(response, setOperators)
      })
      .catch(() => {
        setOperators([{ value: '', label: '' }])
      })
      .finally(() => {
        setLoader(false)
      })
  }, [filters.account_route, filters.channel, filters.region])

  const handleSearch = async () => {
    setLoader(true)
    const queryParams = buildQueryParams()
    console.log(queryParams)
    let makerId = null
    const makerCheckerResponse = await api
      .post('corporate/makerCheckerRole/list', {
        search: userAuth.email,
        pageCode: 'OPC',
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

    const operatorConfigListPayload = {
      ...queryParams,
      makerId: makerId ?? null,
      getAll:
        (userAuth.role as string).toLowerCase() === 'corpadmin' ||
        (userAuth.role as string).toLowerCase() === 'admin',
    }

    await api
      .post(`/corporate/autoReconSettlement/operator-config/list`, operatorConfigListPayload)
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

  function handleView(item: any) {
    router.push(`/settlement/config-view?id=${item}`)
  }

  function toggleFilter(param: any) {
    // if (param === false) {
    //   handleSearch()
    // }
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
                <h4>Configuration List</h4>
              </CCol>
              <CCol className="mb-3 text-end" xs={6}>
                <CButton
                  onClick={() => {
                    toggleFilter(!showFilter)
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
                    <CCol md={3}>
                      <CFormLabel htmlFor="account_route">Account Route</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="account_route"
                          value={filters.account_route}
                          onChange={handleFilterChange}
                        >
                          <option value="">Select Account Route</option>
                          {configAccountRoutes.map((ar) => (
                            <option key={`ar-${ar.value}`} value={ar.value}>
                              {ar.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CFormLabel htmlFor="channel">Channel</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="channel"
                          value={filters.channel}
                          onChange={handleFilterChange}
                        >
                          <option value="">Select Channel</option>
                          {configChannels.map((ch) => (
                            <option key={`ch-${ch.value}`} value={ch.value}>
                              {ch.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CFormLabel htmlFor="region">Region</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="region"
                          value={filters.region}
                          onChange={handleFilterChange}
                        >
                          <option value="">Select Region</option>
                          {configRegions.map((rg) => (
                            <option key={`rg-${rg.value}`} value={rg.value}>
                              {rg.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol md={3}>
                      <CFormLabel htmlFor="operator">Operator</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormSelect
                          id="operator"
                          value={filters.operator}
                          onChange={handleFilterChange}
                          disabled={!(filters.account_route && filters.channel && filters.region)}
                        >
                          <option value="">Select Operator</option>
                          {operators.map((op) => (
                            <option key={`op-${op.value}-${op.label}`} value={op.value}>
                              {op.label}
                            </option>
                          ))}
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
                  account_route: (item: { account_route: string }) => (
                    <td>
                      <CBadge color="warning otherStatus">{item.account_route}</CBadge>
                    </td>
                  ),
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
                        title="View Configuration"
                        onClick={() => {
                          handleView(item.id)
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
                            title="Change Configuration Status"
                            onClick={() => {
                              updateConfigurationStatus(item.id)
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

export default ConfigurationList
