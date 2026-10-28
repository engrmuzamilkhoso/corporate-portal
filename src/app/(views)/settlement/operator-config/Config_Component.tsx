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
  CFormCheck,
  CRow,
  CMultiSelect,
  CBadge,
  CImage,
} from '@coreui/react-pro'
import { save } from '@/utils/crudBtnTexts'
import { InputTag } from '@/components'
import { clearPreviewData } from 'next/dist/server/api-utils'
import useToastNotification from '@/hooks/toastNotification'
import ToastNotification from '@/components/ToastNotification'
import Loader from '@/components/loader'
import api from '@/utils/axios'
import { selectUserAuth, useTypedSelector } from '@/store'
import { useRouter } from 'next/navigation'
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
import { useFetchOperators } from '@/hooks/operator-config/useFetchOperators'
import { useFetchOperatorMerchants } from '@/hooks/operator-config/useFetchOperatorMerchants'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { operatorLogo } from '@/utils/operatorLogos'

const ConfigFormComponent = ({
  makerCheckerEnabledStatus = true,
}: {
  makerCheckerEnabledStatus: boolean
}) => {
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

  const [showReqHeaderNote, setShowReqHeaderNote] = useState(false)
  const [showEmailNote, setShowEmailNote] = useState(false)

  const [disableRegion, setDisableRegion] = useState(false)

  const [operators, setOperators] = useState<Operator[]>([])
  const [operatorMerchantIDs, setOperatorMerchantIDs] = useState<ConfigurationDropdownOption[]>([])
  const [checkerList, setCheckerList] = useState<{ label: string; value: string }[]>([])

  // trim string entries before submitting
  // verify validation at the end has all variables
  const [configData, setConfigData] = useState<ConfigData>({
    id: null,
    templateName: '',
    account_route: '',
    region: '',
    channel: '',
    operator: '',
    operatorMerchantId: [], // This will be a list of IDs
    fileLimit: 0,
    cutOffTime: '',
    filename: '',
    extension: '',
    type: '',
    dbType: '',
    thresholdTime: 0,
    headers: [],
    emails: [],
    headerMappings: [{ simpaisaHeader: '', mappedHeader: '' }],
    makerId: '',
    checkerId: null,
    applyConfiguration: makerCheckerEnabledStatus ? false : true,
    deactivateConfiguration: false,
    makerCheckerStatus: null,
    makerCheckerId: null,
    comments: '',
    isCorporate: true,
    operatorConfigurationStatus: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      setLoader(true)

      try {
        const [makerResponse, checkerResponse] = await Promise.all([
          api.post('corporate/makerCheckerRole/list', {
            search: userAuth.email,
            pageCode: 'OPC',
            role: 'Maker',
          }),
          api.post('corporate/makerCheckerRole/checkerByScreen?pageCode=OPC'),
        ])

        if (makerResponse.status === 200) {
          const maker = makerResponse.data.content[0].id
          setConfigData((prevData) => ({ ...prevData, makerId: maker }))
          console.log(maker)
        }

        if (checkerResponse.status === 200) {
          const pageData = checkerResponse.data
          const checkerListData = (pageData as any[])
            .filter((checker) => checker.userDetail.userID !== userAuth.id)
            .map((page) => ({
              label: page.userDetail.firstName + ' ' + page.userDetail.lastName,
              value: page.id,
            }))
          setCheckerList(checkerListData)
          console.log('checker list', checkerListData)
        }
      } catch (error) {
        console.error('error occured: ', error)
      } finally {
        setLoader(false)
      }
    }

    fetchData()
  }, [])

  useFetchOperators(configData.account_route, configData.region, configData.channel, configData.operator, setOperators, setLoader)
  useFetchOperatorMerchants(configData, setOperatorMerchantIDs, setLoader)

  const handleChange = (e: any) => {
    const { name, value, type } = e.target
    console.log('name: ', name)
    console.log('value: ', value)
    console.log('type: ', type)

    if (name === 'channel') {
      setDisableRegion(false)

      if (value === 'Collection') {
        setConfigData((prevData) => ({
          ...prevData,
          type: reconciliationTypes[0].value,
        }))
      } else {
        setConfigData((prevData) => ({
          ...prevData,
          type: reconciliationTypes[1].value,
        }))
      }

      if (value === 'Disbursement') {
        setConfigData((prevData) => ({
          ...prevData,
          region: 'Pakistan',
        }))
        setDisableRegion(true)
      }

      setOperators([])
    }

    setConfigData((prevData) => ({
      ...prevData,
      [name]: type === 'number' || name === 'thresholdTime' ? parseInt(value) || 0 : value,
    }))
    if (name === 'thresholdTime') {
      console.log('tt: ', configData.thresholdTime)
    }
    if (name === 'type') {
      console.log(configData.type)
    }
  }

  const handleRequiredHeaderChange = (e: any) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      const newHeader = e.target.value.trim()

      setConfigData((prevData) => {
        if (prevData.headers.includes(newHeader)) {
          console.log('Duplicate entry')
          showToast('error', 'This header has already been entered')
          return prevData
        }

        return {
          ...prevData,
          headers: [...prevData.headers, newHeader],
        }
      })

      setShowReqHeaderNote(false)
      e.target.value = ''
    }
  }

  const handleRecipientEmailsChange = (e: any) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      const newEmail = e.target.value.trim()

      const newEmailValid = isValidEmail(newEmail)

      if (!newEmailValid) {
        showToast('error', 'Please enter a valid email address')
        return
      }

      setConfigData((prevData) => {
        if (prevData.emails.includes(newEmail)) {
          console.log('Duplicate entry')
          showToast('error', 'This recepient has already been added')
          return prevData
        }

        return {
          ...prevData,
          emails: [...prevData.emails, newEmail],
        }
      })

      setShowEmailNote(false)
      e.target.value = ''
    }
  }

  const handleRemoveRecepient = (indexToRemove: number) => {
    setConfigData((prevData) => ({
      ...prevData,
      emails: prevData.emails.filter((_, index) => index !== indexToRemove),
    }))
  }

  const handleRemoveHeader = (indexToRemove: number) => {
    setConfigData((prevData) => ({
      ...prevData,
      headers: prevData.headers.filter((_, index) => index !== indexToRemove),
    }))
  }

  const handleHeaderMappingChange = (
    index: any,
    value: any,
    field: 'simpaisaHeader' | 'mappedHeader',
  ) => {
    console.log('merchant op ids: ', configData)
    setConfigData((prevData) => ({
      ...prevData,
      headerMappings: prevData.headerMappings.map((mapping, i) =>
        i === index ? { ...mapping, [field]: value } : mapping,
      ),
    }))
  }

  const addHeaderMapping = () => {
    setConfigData((prevData) => ({
      ...prevData,
      headerMappings: [...prevData.headerMappings, { simpaisaHeader: '', mappedHeader: '' }],
    }))
  }

  const deleteHeaderMapping = (index: number) => {
    const updatedHeaderMappings = configData.headerMappings.filter(
      (_, headerIndex) => headerIndex !== index,
    )
    setConfigData((prevData) => ({
      ...prevData,
      headerMappings: updatedHeaderMappings,
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
      isCorporate,
    } = configData
    const checker = makerCheckerEnabledStatus ? checkerId !== '' : true

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
      headerMappings.every((m) => m.simpaisaHeader.trim() !== '' && m.mappedHeader.trim() !== '') &&
      makerId &&
      checker &&
      applyConfiguration !== undefined &&
      deactivateConfiguration !== undefined &&
      isCorporate
    )
  }

  const handleSubmit = (e: any) => {
    console.log('Configuration Data:', configData)
    e.preventDefault()
    setValidated(false)

    const isFormValid = validateForm()

    if (!isFormValid) {
      setValidated(true)
      // Show toast notification for validation error
      showToast('error', 'Please fill all required fields!')
      return
    }

    const operatorName = operators.find((op: any) => op.value === configData.operator)?.label || ''

    const requestData = {
      ...configData,
      operator: { [configData.operator]: operatorName },
    }

    console.log('requestData: ', requestData)

    setLoader(true)

    api
      .post('/corporate/autoReconSettlement/operator-config/saveAndUpdate', requestData)
      .then((res: any) => {
        console.log()
        const response = res.data
        if (response.status != '0000') {
          showToast('error', (response.message as string).replace(/-/g, ' '))
        } else {
          // redirect to listing screen after success
          setDisabled(true)
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
              <CForm onSubmit={handleSubmit}>
                <CRow className="mb-4">
                  <CCol>
                    <CFormLabel htmlFor="templateName">Configuration Name</CFormLabel>
                    <CFormInput
                      type="text"
                      name="templateName"
                      value={configData.templateName}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !configData.templateName ? 'is-invalid mt-2' : 'mt-2'}
                      placeholder="Enter this configuration's name"
                    ></CFormInput>
                  </CCol>

                  <CCol>
                    <CFormLabel htmlFor="region">Region</CFormLabel>
                    <CFormSelect
                      name="region"
                      value={configData.region}
                      onChange={handleChange}
                      required
                      disabled={disabled || disableRegion}
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
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={
                        validated && !configData.account_route ? 'is-invalid mt-2' : 'mt-2'
                      }
                    >
                      <option value="">Select Account Route</option>
                      {accountRoutes.map((account_route) => (
                        <option key={account_route.value} value={account_route.value}>
                          {account_route.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>

                  <CCol>
                    <CFormLabel htmlFor="channel">Channel</CFormLabel>
                    <CFormSelect
                      name="channel"
                      value={configData.channel}
                      onChange={handleChange}
                      required
                      disabled={disabled}
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
                      placeholder="Select operator"
                      resetSelectionOnOptionsChange={true}
                      multiple={false}
                      options={operators}
                      onChange={(selected) => {
                        setConfigData((prevData) => ({
                          ...prevData,
                          operator: selected.length ? selected[0].value.toString() : '',
                        }))
                        setOperatorMerchantIDs([])
                      }}
                      optionsTemplate={(option) => (
                        <div className="d-flex">
                          <CImage
                            className="me-2"
                            src={operatorLogo(option.value)}
                            width={24}
                            height={24}
                          />{' '}
                          {option.label}
                        </div>
                      )}
                      optionsStyle="text"
                      required
                      virtualScroller
                      disabled={disabled}
                      className={
                        validated && (!configData.operator || configData.operator.length === 0)
                          ? 'is-invalid mt-2'
                          : 'mt-2'
                      }
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
                      disabled={disabled}
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
                      disabled={disabled}
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
                      disabled={disabled}
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
                    <CFormInput
                      type="text"
                      name="headers"
                      onKeyDown={handleRequiredHeaderChange}
                      onChange={(e) => setShowReqHeaderNote(e.target.value.trim() !== '')}
                      required
                      disabled={disabled}
                      className={
                        validated && !configData.headers.length ? 'is-invalid mt-2' : 'mt-2'
                      }
                      placeholder="Enter required headers"
                    />
                    {showReqHeaderNote && (
                      <div
                        className="mt-1"
                        style={{
                          color: validated && !configData.headers.length ? 'red' : 'gray',
                          fontSize: '12px',
                        }}
                      >
                        Press the Enter key to add
                      </div>
                    )}
                    <CCol className="mt-2">
                      {configData.headers.map((header, index) => (
                        <InputTag
                          index={index}
                          value={header}
                          onRemove={handleRemoveHeader}
                          disabled={disabled}
                        />
                      ))}
                    </CCol>
                  </CCol>

                  <CCol xl={6}>
                    <CFormLabel htmlFor="notifRecepientEmails">Notification Recepients</CFormLabel>
                    <CFormInput
                      type="email"
                      name="notifRecepientEmails"
                      onKeyDown={handleRecipientEmailsChange}
                      onChange={(e) => setShowEmailNote(e.target.value.trim() !== '')}
                      required
                      disabled={disabled}
                      className={
                        validated && !configData.emails.length ? 'is-invalid mt-2' : 'mt-2'
                      }
                      placeholder="Enter notification recepient emails"
                    />
                    {showEmailNote && (
                      <div
                        className="mt-1"
                        style={{
                          color: validated && !configData.emails.length ? 'red' : 'gray',
                          fontSize: '12px',
                        }}
                      >
                        Press the Enter key to add
                      </div>
                    )}
                    <CCol className="mt-2">
                      {configData.emails.map((header, index) => (
                        <InputTag
                          index={index}
                          value={header}
                          onRemove={handleRemoveRecepient}
                          disabled={disabled}
                        />
                      ))}
                    </CCol>
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
                      disabled={disabled || !!configData.type}
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
                      disabled={disabled}
                      className={validated && !configData.dbType ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      <option value="">Select Product Type</option>
                      {configData.type !== '' &&
                        productTypes[configData.type as keyof typeof productTypes].map((type) => (
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
                      disabled={disabled}
                      className={
                        validated && configData.thresholdTime === undefined
                          ? 'is-invalid mt-2'
                          : 'mt-2'
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
                        disabled={disabled}
                        min="0"
                        className={
                          validated && configData.fileLimit === undefined ? 'is-invalid' : ''
                        }
                      />
                    </div>
                  </CCol>
                </CRow>

                <CRow className="mb-4">
                  <CCol xl={6}>
                    <CFormLabel htmlFor="operatorMerchantID">Operator Merchant Store ID</CFormLabel>
                    <CMultiSelect
                      name="operatorMerchantID"
                      resetSelectionOnOptionsChange={true}
                      selectionType={configData.operatorMerchantId.length > 1 ? 'counter' : 'tags'}
                      options={operatorMerchantIDs}
                      onChange={(selected) => {
                        setConfigData((prev) => ({
                          ...prev,
                          operatorMerchantId: selected.map((option) => option.value.toString()),
                        }))
                      }}
                      disabled={disabled}
                      virtualScroller
                      visibleItems={5}
                      className={
                        validated &&
                        (!configData.operatorMerchantId ||
                          configData.operatorMerchantId.length === 0)
                          ? 'is-invalid mt-2'
                          : 'mt-2'
                      }
                    />
                  </CCol>

                  {makerCheckerEnabledStatus && (
                    <CCol>
                      <CFormLabel htmlFor="checkerId">Checker</CFormLabel>
                      <CFormSelect
                        name="checkerId"
                        value={configData.checkerId ?? ''}
                        onChange={handleChange}
                        required
                        disabled={disabled}
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
                  )}
                </CRow>

                <hr />
                <CRow className="mb-4">
                  <CCol>
                    <h4 className="mb-4 text-center">Header Mapping</h4>

                    <CRow className="mb-3">
                      <CCol md={5}>
                        <h6 className="" style={{ marginBottom: 1 }}>
                          Simpaisa Header
                        </h6>
                      </CCol>
                      <CCol md={5}>
                        <h6 className="" style={{ marginBottom: 1 }}>
                          Mapped Header
                        </h6>
                      </CCol>
                    </CRow>

                    {configData.headerMappings.map((mapping, index) => (
                      <CRow key={index} className="mb-3 align-items-center">
                        <CCol md={5}>
                          <CFormInput
                            type="text"
                            required
                            value={mapping.simpaisaHeader}
                            onChange={(e) =>
                              handleHeaderMappingChange(index, e.target.value, 'simpaisaHeader')
                            }
                            placeholder="Enter Simpaisa header"
                            className={
                              validated && !mapping.simpaisaHeader ? 'is-invalid mt-2' : 'mt-2'
                            }
                            disabled={disabled}
                          />
                        </CCol>
                        <CCol md={5}>
                          <CFormInput
                            type="text"
                            required
                            value={mapping.mappedHeader}
                            onChange={(e) =>
                              handleHeaderMappingChange(index, e.target.value, 'mappedHeader')
                            }
                            placeholder="Enter mapped header"
                            className={
                              validated && !mapping.mappedHeader ? 'is-invalid mt-2' : 'mt-2'
                            }
                            disabled={disabled}
                          />
                        </CCol>
                        {index !== configData.headerMappings.length - 1 ? (
                          <CCol lg={1} className="mt-2 align-items-center">
                            <CButton
                              color="danger"
                              variant="outline"
                              onClick={() => deleteHeaderMapping(index)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CCol>
                        ) : (
                          <>
                            <CCol lg={1} className="mt-2 align-items-center">
                              <CButton
                                color="secondary"
                                variant="outline"
                                onClick={addHeaderMapping}
                              >
                                <CIcon icon={cilPlus} />
                              </CButton>
                            </CCol>
                            {index !== 0 && (
                              <CCol lg={1} className="mt-2 align-items-center">
                                <CButton
                                  color="danger"
                                  variant="outline"
                                  onClick={() => deleteHeaderMapping(index)}
                                >
                                  <CIcon icon={cilTrash} />
                                </CButton>
                              </CCol>
                            )}
                          </>
                        )}
                      </CRow>
                    ))}
                  </CCol>
                </CRow>

                <CRow className="text-end">
                  <CCol>
                    <CButton
                      type="button"
                      color="primary btnCustom mt-4"
                      onClick={handleSubmit}
                      disabled={disabled}
                    >
                      {save}
                      <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <ToastNotification />
    </CContainer>
  )
}

export default ConfigFormComponent
