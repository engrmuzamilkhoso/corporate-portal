'use client'

import { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
  CMultiSelect,
  CBadge,
} from '@coreui/react-pro'
import { cancel, Close, save } from '@/utils/crudBtnTexts'
import { InputTag } from '@/components'
import useToastNotification from '@/hooks/toastNotification'
import ToastNotification from '@/components/ToastNotification'
import Loader from '@/components/loader'
import api from '@/utils/axios'
import { selectUserAuth, useTypedSelector } from '@/store'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TaskStatus } from '@/utils/status.enum'
import {
  configAccountRoutes,
  configChannels,
  ConfigData,
  configFileExtensions,
  configProductTypes,
  configReconciliationTypes,
  configRegions,
  ConfigurationDropdownOption,
  Operator,
  operatorMapping,
} from '@/utils/configurationUtils'
import { isValidEmail } from '@/utils/utility'
import { useFetchConfigData } from '@/hooks/operator-config/useFetchConfigData'
import { useFetchOperators } from '@/hooks/operator-config/useFetchOperators'
import { useFetchOperatorMerchants } from '@/hooks/operator-config/useFetchOperatorMerchants'
import { useFetchCheckers } from '@/hooks/operator-config/useFetchCheckers'
import PreSelectedList from '@/components/PreSelectedMultiSelect'

const OperatorConfigView = () => {
  const accountRoutes = configAccountRoutes
  const regions = configRegions
  const channels = configChannels
  const fileExtensions = configFileExtensions
  const reconciliationTypes = configReconciliationTypes
  const productTypes = configProductTypes

  const router = useRouter()
  const userAuth = useTypedSelector(selectUserAuth)
  const { showToast } = useToastNotification()
  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [disabledButton, setDisabledButton] = useState(true)

  const [operators, setOperators] = useState<Operator[]>([])
  const [operatorMerchantIDs, setOperatorMerchantIDs] = useState<ConfigurationDropdownOption[]>([])
  const [checkerList, setCheckerList] = useState<{ label: string; value: string }[]>([])

  const searchParams = useSearchParams()
  const [configData, setConfigData] = useState<ConfigData>({
    id: '',
    templateName: '',
    account_route: '',
    region: '',
    channel: '',
    operator: '',
    operatorMerchantId: [], // This will be a list of IDs
    fileLimit: 0,
    cutOffTime: '00:00',
    filename: '',
    extension: '',
    type: '',
    dbType: '',
    thresholdTime: 0,
    headers: [],
    emails: [],
    headerMappings: [
      { simpaisaHeader: 'TxnDate', mappedHeader: 'Date' },
      { simpaisaHeader: 'TxnAmount', mappedHeader: 'Amount' },
      { simpaisaHeader: 'TxnStatus', mappedHeader: 'Status' },
    ],
    makerId: '',
    checkerId: '',
    applyConfiguration: true,
    deactivateConfiguration: false,
    makerCheckerStatus: '',
    makerCheckerId: '',
    comments: '',
    isCorporate: true,
    operatorConfigurationStatus: '',
  })

  useFetchConfigData(searchParams.get('id') || '', setConfigData, setLoader, setDisabled)

  useFetchCheckers(userAuth.id, setCheckerList, setLoader)

  useFetchOperators(configData.account_route, configData.region, configData.channel, configData.operator, setOperators, setLoader)
  useFetchOperatorMerchants(configData, setOperatorMerchantIDs, setLoader)

  const handleChange = (e: any) => {
    setDisabledButton(false)
    const { name, value, type } = e.target

    setConfigData((prevData) => ({
      ...prevData,
      [name]: type === 'number' || name === 'thresholdTime' ? parseInt(value) || 0 : value,
    }))
  }

  const handleHeaderMappingChange = (index: any, value: any) => {
    setDisabledButton(false)
    setConfigData((prevData) => ({
      ...prevData,
      headerMappings: prevData.headerMappings.map((mapping, i) =>
        i === index ? { ...mapping, mappedHeader: value } : mapping,
      ),
    }))
  }

  const validateForm = () => {
    const {
      templateName,
      account_route,
      region,
      channel,
      operator,
      operatorMerchantId,
      fileLimit,
      cutOffTime,
      filename,
      extension,
      type,
      dbType,
      thresholdTime,
      headers,
      emails,
      headerMappings,
      makerId,
      checkerId,
      applyConfiguration,
      deactivateConfiguration,
      makerCheckerStatus,
      makerCheckerId,
      isCorporate,
    } = configData

    return (
      templateName &&
      account_route &&
      region &&
      channel &&
      operator &&
      operatorMerchantId.length > 0 &&
      typeof fileLimit === 'number' &&
      cutOffTime &&
      dbType &&
      filename &&
      extension &&
      type &&
      typeof thresholdTime === 'number' &&
      headers.length > 0 &&
      emails.length > 0 &&
      headerMappings.length > 0 &&
      makerId &&
      checkerId &&
      applyConfiguration !== undefined &&
      deactivateConfiguration !== undefined &&
      makerCheckerStatus &&
      makerCheckerId &&
      isCorporate
    )
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    setValidated(false)

    const isFormValid = validateForm()

    if (!isFormValid) {
      setValidated(true)
      // Show toast notification for validation error
      showToast('error', 'Please fill all required fields!')
      return
    }

    console.log('Configuration Data:', configData)

    const operatorName =
      operators.find((op: any) => op.id === Number(configData.operator))?.label || ''

    const requestData = {
      ...configData,
      operator: { [configData.operator]: operatorName },
    }

    console.log('requestData: ', requestData)

    setLoader(true)
    setDisabled(true)

    api
      .post('/corporate/autoReconSettlement/operator-config/saveAndUpdate', requestData)
      .then((res: any) => {
        const response = res.data
        if (response.status != '0000') {
          showToast('error', (response.message as string).replace(/-/g, ' '))
        } else {
          // redirect to listing screen after success
          showToast('success', 'Success', {
            onClose: () => {
              router.push('/settlement/config-list')
            },
          })
        }
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
        setLoader(false)
        setDisabled(false)
        setDisabledButton(false)
      })
  }

  return (
    <CContainer className="px-4">
      <Loader isLoading={loader} />
      <CRow>
        <CCol xl={4}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h5 className="mb-4">Operator Configuration</h5>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <CRow className="mb-3">
                <CCol lg={6} className="d-flex">
                  <CFormLabel htmlFor="Template Status" className="my-auto me-2">
                    Configuration Status
                  </CFormLabel>
                  <div>
                    {configData.makerCheckerStatus === 'Pending' ? (
                      <CBadge color="success pendingStatus px-4 py-2">Pending</CBadge>
                    ) : configData.makerCheckerStatus == 'Approved' ? (
                      <CBadge color="success successStatus px-4 py-2">Approved</CBadge>
                    ) : configData.makerCheckerStatus == 'Review' ? (
                      <CBadge color="success reviewStatus px-4 py-2">In Review</CBadge>
                    ) : (
                      <CBadge color="success failedStatus px-4 py-2">
                        {configData.makerCheckerStatus}
                      </CBadge>
                    )}
                  </div>
                </CCol>
                <CCol lg={6} className="d-flex justify-content-end">
                  <CFormLabel htmlFor="Application Status" className="my-auto me-2">
                    Application Status
                  </CFormLabel>
                  <div>
                    {configData?.operatorConfigurationStatus === 'activate' ? (
                      <CBadge className="successStatus px-4 py-2">Active</CBadge>
                    ) : configData?.operatorConfigurationStatus === 'inactive' ? (
                      <CBadge className="otherStatus px-4 py-2">Inactive</CBadge>
                    ) : configData?.operatorConfigurationStatus === 'hold' ? (
                      <CBadge className="pendingStatus px-4 py-2">On Hold</CBadge>
                    ) : configData?.operatorConfigurationStatus === 'delete' ? (
                      <CBadge className="failedStatus px-4 py-2">Deleted</CBadge>
                    ) : (
                      <CBadge className="failedStatus px-4 py-2">
                        {configData.operatorConfigurationStatus ?? 'Inactive'}
                      </CBadge>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-4">
                  <CCol>
                    <CFormLabel htmlFor="templateName">Configuration Name</CFormLabel>
                    <CFormInput
                      type="text"
                      name="templateName"
                      value={configData.templateName}
                      required
                      disabled
                      className={validated && !configData.templateName ? 'is-invalid mt-2' : 'mt-2'}
                      placeholder="Enter this configuration's name"
                    ></CFormInput>
                  </CCol>

                  <CCol>
                    <CFormLabel htmlFor="region">Region</CFormLabel>
                    <CFormSelect
                      name="region"
                      value={configData.region}
                      required
                      disabled
                      className={validated && !configData.region ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      <option value="">Select Region</option>
                      {regions.map((region) => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="mb-4">
                  <CCol>
                    <CFormLabel htmlFor="account_route">Account Route</CFormLabel>
                    <CFormSelect
                      name="account_route"
                      value={configData.account_route}
                      required
                      disabled
                      className={
                        validated && !configData.account_route ? 'is-invalid mt-2' : 'mt-2'
                      }
                    >
                      <option value="">Select Account Route</option>
                      {accountRoutes.map((accountRoute) => (
                        <option key={accountRoute.value} value={accountRoute.value}>
                          {accountRoute.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol>
                    <CFormLabel htmlFor="channel">Channel</CFormLabel>
                    <CFormSelect
                      name="channel"
                      value={configData.channel}
                      required
                      disabled
                      className={validated && !configData.channel ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      <option value="">Select Channel</option>
                      {channels.map((channel) => (
                        <option key={channel.value} value={channel.value}>
                          {channel.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="mb-4">
                  <CCol>
                    <CFormLabel htmlFor="operator">Operator</CFormLabel>
                    <CMultiSelect
                      name="operator"
                      resetSelectionOnOptionsChange={false}
                      multiple={false}
                      options={operators}
                      onChange={(selected) => {
                        if (selected.length > 0) {
                          setConfigData((prevData) => ({
                            ...prevData,
                            operator: selected[0].value.toString(),
                            operatorMerchantId: [],
                          }))
                        }
                      }}
                      required
                      disabled
                      className={validated && !configData.operator ? 'is-invalid mt-2' : 'mt-2'}
                    />
                  </CCol>

                  <CCol>
                    <CFormLabel htmlFor="cutOffTime">Cutoff Time:</CFormLabel>
                    <CFormInput
                      type="time"
                      name="cutOffTime"
                      value={configData.cutOffTime}
                      onChange={handleChange}
                      required
                      disabled
                      className={validated && !configData.cutOffTime ? 'is-invalid mt-2' : 'mt-2'}
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-4">
                  <CCol>
                    <CFormLabel htmlFor="filename">File Name Pattern:</CFormLabel>
                    <CFormInput
                      type="text"
                      name="filename"
                      value={configData.filename}
                      onChange={handleChange}
                      required
                      disabled
                      className={validated && !configData.filename ? 'is-invalid mt-2' : 'mt-2'}
                      placeholder="Enter expected file name pattern"
                    />
                  </CCol>

                  <CCol>
                    <CFormLabel htmlFor="extension">Allowed File Extension:</CFormLabel>
                    <CFormSelect
                      name="extension"
                      value={configData.extension}
                      onChange={handleChange}
                      required
                      disabled
                      className={validated && !configData.extension ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      <option value="">Select File Extension</option>
                      {fileExtensions.map((extension) => (
                        <option key={extension.value} value={extension.value}>
                          {extension.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="mb-4">
                  <CCol xl={6}>
                    <CFormLabel htmlFor="headers">Required Headers</CFormLabel>
                    <PreSelectedList list={configData.headers} />
                  </CCol>

                  <CCol xl={6}>
                    <CFormLabel htmlFor="notifRecepientEmails">Notification Recepients</CFormLabel>
                    <PreSelectedList list={configData.emails} />
                  </CCol>
                </CRow>

                <CRow className="mb-4">
                  <CCol>
                    <CFormLabel htmlFor="type">Reconciliation Type</CFormLabel>
                    <CFormSelect
                      name="type"
                      value={configData.type}
                      onChange={handleChange}
                      required
                      disabled
                      className={validated && !configData.type ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      <option value="">Select Reconciliation Type</option>
                      {reconciliationTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol>
                    <CFormLabel htmlFor="dbType">Product Type</CFormLabel>
                    <CFormSelect
                      name="dbType"
                      value={configData.dbType}
                      onChange={handleChange}
                      required
                      disabled
                      className={validated && !configData.dbType ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      <option value="">Select Product Type</option>
                      {productTypes[configData.type as keyof typeof productTypes]?.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="mb-4">
                  <CCol>
                    <CFormLabel htmlFor="thresholdTime">Threshold Time</CFormLabel>
                    <CFormSelect
                      type="number"
                      name="thresholdTime"
                      value={configData.thresholdTime}
                      onChange={handleChange}
                      required
                      disabled
                      className={
                        validated && !configData.thresholdTime ? 'is-invalid mt-2' : 'mt-2'
                      }
                    >
                      <option value="">Select Threshold Time</option>
                      {[...Array(61).keys()].map((min) => (
                        <option key={min} value={min}>
                          {min} min
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol>
                    <CFormLabel htmlFor="fileLimit">Number of Files</CFormLabel>
                    <div className="mt-2">
                      <CFormInput
                        type="number"
                        name="fileLimit"
                        value={configData.fileLimit}
                        onChange={handleChange}
                        required
                        disabled
                        min="0"
                        className={
                          validated && configData.fileLimit === undefined ? 'is-invalid' : ''
                        }
                      />
                    </div>
                  </CCol>
                </CRow>

                <CRow className="mb-4">
                  <CCol>
                    <CFormLabel htmlFor="operatorMerchantID">Operator Merchant Store ID</CFormLabel>
                    <PreSelectedList list={operatorMerchantIDs} />
                    {/* <CMultiSelect
                      name="operatorMerchantID"
                      options={operatorMerchantIDs}
                      onChange={(selected) =>
                        setConfigData((prev) => ({
                          ...prev,
                          operatorMerchantId: selected.map((option) => option.value.toString()),
                        }))
                      }
                      disabled
                      className={
                        validated &&
                        (!configData.operatorMerchantId ||
                          configData.operatorMerchantId.length === 0)
                          ? 'is-invalid mt-2'
                          : 'mt-2'
                      }
                    /> */}
                  </CCol>

                  <CCol>
                    <CFormLabel htmlFor="checkerId">Checker</CFormLabel>
                    <CFormSelect
                      name="checkerId"
                      value={configData.checkerId ?? ''}
                      onChange={handleChange}
                      required
                      disabled
                      className={validated && !configData.checkerId ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      <option value="">Select Checker</option>
                      {checkerList.map((checker) => (
                        <option key={checker.value} value={checker.value}>
                          {checker.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="mb-4">
                  <CCol>
                    <h5 className="mb-4 text-center">Header Mapping</h5>

                    <CRow className="mb-3">
                      <CCol md={6}>
                        <h6 className="text-center">Simpaisa Header</h6>
                      </CCol>
                      <CCol md={6}>
                        <h6 className="text-center">Mapped Header</h6>
                      </CCol>
                    </CRow>

                    {configData.headerMappings.map((mapping, index) => (
                      <CRow key={index} className="mb-3 align-items-center">
                        <CCol md={6}>
                          <div className="text-center p-2 bg-light border rounded">
                            {mapping.simpaisaHeader}
                          </div>
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            type="text"
                            value={mapping.mappedHeader}
                            onChange={(e) => handleHeaderMappingChange(index, e.target.value)}
                            placeholder="Input text"
                            disabled
                          />
                        </CCol>
                      </CRow>
                    ))}
                  </CCol>
                </CRow>

                <CRow className="text-end">
                  <CCol>
                    <Link href="/settlement/config-list" passHref>
                      <CButton color="danger" className="text-white me-2">
                        {Close}
                      </CButton>
                    </Link>
                  </CCol>
                </CRow>

                {/* <CRow>
                  <CCol xl={6}>
                    <PreSelectedMultiSelect/>
                  </CCol>
                </CRow> */}
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <ToastNotification />
    </CContainer>
  )
}

export default OperatorConfigView
