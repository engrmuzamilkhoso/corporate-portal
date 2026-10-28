'use client'

import { InputTag } from '@/components'
import PreSelectedList from '@/components/PreSelectedMultiSelect'
import ToastNotification from '@/components/ToastNotification'
import Loader from '@/components/loader'
import { useFetchCheckers } from '@/hooks/operator-config/useFetchCheckers'
import { useFetchConfigData } from '@/hooks/operator-config/useFetchConfigData'
import { useFetchOperatorMerchants } from '@/hooks/operator-config/useFetchOperatorMerchants'
import { useFetchOperators } from '@/hooks/operator-config/useFetchOperators'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import api from '@/utils/axios'
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
} from '@/utils/configurationUtils'
import { cancel, Close, save } from '@/utils/crudBtnTexts'
import { TaskStatus } from '@/utils/status.enum'
import { isValidEmail } from '@/utils/utility'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CMultiSelect,
  CImage,
  CRow,
} from '@coreui/react-pro'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilTrash } from '@coreui/icons'
import { operatorLogo } from '@/utils/operatorLogos'

const OperatorConfigUpdate = () => {
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

  const [showReqHeaderNote, setShowReqHeaderNote] = useState(false)
  const [showEmailNote, setShowEmailNote] = useState(false)
  const [resetOperatorMerchants, setResetOperatorMerchants] = useState(false)

  const [operators, setOperators] = useState<Operator[]>([])
  const [operatorMerchantIDs, setOperatorMerchantIDs] = useState<ConfigurationDropdownOption[]>([])
  const [checkerList, setCheckerList] = useState<{ label: string; value: string }[]>([])

  const searchParams = useSearchParams()

  // trim string entries before submitting
  // verify validation at the end has all variables
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
    headerMappings: [{ simpaisaHeader: '', mappedHeader: '' }],
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

  const handleRequiredHeaderChange = (e: any) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      setDisabledButton(false)

      const newHeader = e.target.value.trim()

      setConfigData((prevData) => {
        if (prevData.headers.includes(newHeader)) {
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
      setDisabledButton(false)

      const newEmail = e.target.value.trim()

      const newEmailValid = isValidEmail(newEmail)

      if (!newEmailValid) {
        showToast('error', 'Please enter a valid email address')
        return
      }

      setConfigData((prevData) => {
        if (prevData.emails.includes(newEmail)) {
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
    setDisabledButton(false)
    setConfigData((prevData) => ({
      ...prevData,
      emails: prevData.emails.filter((_, index) => index !== indexToRemove),
    }))
  }

  const handleRemoveHeader = (indexToRemove: number) => {
    setDisabledButton(false)
    setConfigData((prevData) => ({
      ...prevData,
      headers: prevData.headers.filter((_, index) => index !== indexToRemove),
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
      headerMappings.every((m) => m.simpaisaHeader.trim() !== '' && m.mappedHeader.trim() !== '') &&
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

    const operatorName = operators.find((op: any) => op.value === configData.operator)?.label || ''

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
          setDisabledButton(true)
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
                      placeholder='Select operator'
                      resetSelectionOnOptionsChange={false}
                      multiple={false}
                      options={operators}
                      onChange={(selected) => {
                        setConfigData((prevData) => ({
                          ...prevData,
                          operator: selected.length ? selected[0].value.toString() : '',
                        }))
                        if (
                          (selected.length > 0 &&
                            selected[0].value.toString() !== configData.operator) ||
                          (!selected.length && configData.operator)
                        ) {
                          setResetOperatorMerchants(true)
                          setOperatorMerchantIDs([])
                        }
                      }}
                      optionsTemplate={(option) => (
                        <div className="d-flex">
                          <CImage className="me-2" src={operatorLogo(option.value)} width={24} height={24} /> {option.label}
                        </div>
                      )}
                      optionsStyle='text'
                      required
                      virtualScroller
                      disabled={disabled}
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
                    {disabled ? (
                      <PreSelectedList list={configData.headers} />
                    ) : (
                      <>
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
                      </>
                    )}
                  </CCol>

                  <CCol xl={6}>
                    <CFormLabel htmlFor="notifRecepientEmails">Notification Recepients</CFormLabel>
                    {disabled ? (
                      <PreSelectedList list={configData.emails} />
                    ) : (
                      <>
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
                      </>
                    )}
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
                  <CCol>
                    <CFormLabel htmlFor="operatorMerchantID">Operator Merchant Store ID</CFormLabel>
                    {disabled ? (
                      <PreSelectedList list={operatorMerchantIDs} />
                    ) : (
                      <CMultiSelect
                        name="operatorMerchantID"
                        options={operatorMerchantIDs}
                        resetSelectionOnOptionsChange={resetOperatorMerchants}
                        selectionType={
                          configData.operatorMerchantId.length > 1 ? 'counter' : 'tags'
                        }
                        onChange={(selected) => {
                          setDisabledButton(false)
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
                    )}
                  </CCol>

                  {configData.checkerId && (
                    <CCol>
                      <CFormLabel htmlFor="checkerId">Checker</CFormLabel>
                      <CFormSelect
                        name="checkerId"
                        value={configData.checkerId}
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
                      <CCol md={disabled ? 6 : 5}>
                        <h6 className="" style={{ marginBottom: 1 }}>
                          Simpaisa Header
                        </h6>
                      </CCol>
                      <CCol md={disabled ? 6 : 5}>
                        <h6 className="" style={{ marginBottom: 1 }}>
                          Mapped Header
                        </h6>
                      </CCol>
                    </CRow>

                    {configData.headerMappings.map((mapping, index) => (
                      <CRow key={index} className="mb-3 align-items-center">
                        <CCol md={disabled ? 6 : 5}>
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
                        <CCol md={disabled ? 6 : 5}>
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
                        {!disabled &&
                          (index !== configData.headerMappings.length - 1 ? (
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
                          ))}
                      </CRow>
                    ))}
                  </CCol>
                </CRow>

                {configData.comments && configData.comments.length != 0 && (
                  <CRow className="text-end">
                    <CCol className="d-grid mb-3">
                      <CFormTextarea
                        placeholder="Please add a comment..."
                        value={configData.comments}
                        disabled
                      />
                    </CCol>
                  </CRow>
                )}

                <CRow className="text-end">
                  {configData.makerCheckerStatus &&
                  configData.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Pending ? (
                    <CCol>
                      <Link href="/maker_checker/task-management" passHref>
                        <CButton color="danger" className="text-white me-2">
                          {cancel}
                        </CButton>
                      </Link>

                      <CButton
                        type="button"
                        color="primary btnCustom"
                        onClick={handleSubmit}
                        disabled={disabledButton}
                      >
                        {save}
                        <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                      </CButton>
                    </CCol>
                  ) : configData.makerCheckerStatus &&
                    configData.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Approved ? (
                    <CCol>
                      <Link href="/maker_checker/task-management" passHref>
                        <CButton color="danger" className="text-white me-2">
                          {Close}
                        </CButton>
                      </Link>
                    </CCol>
                  ) : configData.makerCheckerStatus &&
                    configData.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Review ? (
                    <>
                      <CCol className="text-end">
                        <Link href="/maker_checker/task-management" passHref>
                          <CButton color="danger" className="text-white me-2">
                            {cancel}
                          </CButton>
                        </Link>
                        <CButton
                          type="button"
                          color="primary btnCustom"
                          onClick={handleSubmit}
                          disabled={disabledButton}
                        >
                          {save}
                          <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                        </CButton>
                      </CCol>
                    </>
                  ) : (
                    <CCol>
                      <Link href="/maker_checker/task-management" passHref>
                        <CButton color="danger" className="text-white me-2">
                          {Close}
                        </CButton>
                      </Link>
                    </CCol>
                  )}
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

export default OperatorConfigUpdate
