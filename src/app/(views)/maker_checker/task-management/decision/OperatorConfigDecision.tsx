'use client'

import PreSelectedList from '@/components/PreSelectedMultiSelect'
import ToastNotification from '@/components/ToastNotification'
import Loader from '@/components/loader'
import { useFetchCheckers } from '@/hooks/operator-config/useFetchCheckers'
import { fetchConfigData, useFetchConfigData } from '@/hooks/operator-config/useFetchConfigData'
import { useFetchOperatorMerchants } from '@/hooks/operator-config/useFetchOperatorMerchants'
import { useFetchOperators } from '@/hooks/operator-config/useFetchOperators'
import useToastNotification from '@/hooks/toastNotification'
import otherIcon from '@/public/images/alert.gif'
import failedIcon from '@/public/images/ff.gif'
import successIcon from '@/public/images/ss.gif'
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
import { approve, cancel, Close, confirm, inreview, reject } from '@/utils/crudBtnTexts'
import { TaskStatus } from '@/utils/status.enum'
import { cilCheckAlt, cilCommentBubble } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
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
  CModal,
  CModalBody,
  CMultiSelect,
  CRow,
} from '@coreui/react-pro'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

const OperatorConfigDecision = ({ isDecisionDisabled }: { isDecisionDisabled: boolean }) => {
  const accountRoutes = configAccountRoutes
  const regions = configRegions
  const channels = configChannels
  const fileExtensions = configFileExtensions
  const reconciliationTypes = configReconciliationTypes
  const productTypes = configProductTypes

  const userAuth = useTypedSelector(selectUserAuth)
  const { showToast } = useToastNotification()
  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [disabledButton, setDisabledButton] = useState(true)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'review' | ''>('')
  const [comment, setComment] = useState('')
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(false)

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

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value.trim())
    setIsConfirmDisabled(e.target.value.trim() === '') // Disable if comment is empty or whitespace
  }

  const handleDecision = () => {
    console.log('here')

    setDeleteModalVisible(false)
    setLoader(true)
    const id = searchParams.get('id')
    api
      .post('/corporate/autoReconSettlement/operator-config/decisionByChecker', {
        configurationId: id,
        status: decision,
        comments: comment,
      })
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
      .finally(() => {
        fetchConfigData(searchParams.get('id') || '', setConfigData, setLoader, setDisabled)
        setLoader(false)
        showToast('success', 'Task has been ' + decision + ' successfully')
      })
  }

  const handleSubmit = (param: any) => {
    setDecision(param)
    setDeleteModalVisible(true)
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
                      resetSelectionOnOptionsChange={false}
                      multiple={false}
                      options={operators}
                      onChange={(selected) => {
                        if (selected.length > 0) {
                          setConfigData((prevData) => ({
                            ...prevData,
                            operator: selected[0].value.toString(),
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

                {!isDecisionDisabled && (
                  <CRow className="text-end">
                    {configData.makerCheckerStatus &&
                    configData.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Pending ? (
                      <CCol className="crud-btns">
                        <CButton
                          size="sm"
                          type="button"
                          color="success mt-4"
                          onClick={() => handleSubmit('Approved')}
                        >
                          {approve} <CIcon icon={cilCheckAlt} />
                        </CButton>
                        <CButton
                          size="sm"
                          type="button"
                          color="danger text-light mt-4"
                          onClick={() => handleSubmit('Rejected')}
                        >
                          {reject} <i className="bi bi-x-lg"></i>
                        </CButton>
                        <CButton
                          size="sm"
                          type="button"
                          color="info text-light mt-4"
                          onClick={() => handleSubmit('Review')}
                        >
                          {inreview} <CIcon icon={cilCommentBubble} />
                        </CButton>
                        <Link href="/maker_checker/task-management" passHref>
                          <CButton color="secondary" className="me-2 btn-sm mt-4">
                            {Close}
                          </CButton>
                        </Link>
                      </CCol>
                    ) : configData.makerCheckerStatus &&
                      configData.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Approved ? (
                      <CCol className="crud-btns">
                        <Link href="/maker_checker/task-management" passHref>
                          <CButton color="danger" className="text-white me-2">
                            {Close}
                          </CButton>
                        </Link>
                      </CCol>
                    ) : configData.makerCheckerStatus &&
                      configData.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Review ? (
                      // <CRow>
                      <>
                        <CCol className="crud-btns mt-2">
                          <CButton
                            size="sm"
                            type="button"
                            color="success"
                            onClick={() => handleSubmit('Approved')}
                          >
                            {approve} <CIcon icon={cilCheckAlt} />
                          </CButton>
                          <CButton
                            size="sm"
                            type="button"
                            color="danger text-light"
                            onClick={() => handleSubmit('Rejected')}
                          >
                            {reject} <i className="bi bi-x-lg"></i>
                          </CButton>
                          <Link href="/maker_checker/task-management" passHref>
                            <CButton color="secondary btn-sm" className="me-2 btn-sm">
                              {Close}
                            </CButton>
                          </Link>
                        </CCol>
                      </>
                    ) : (
                      // </CRow>
                      <CCol className="crud-btns">
                        <Link href="/maker_checker/task-management" passHref>
                          <CButton color="danger" className="text-white me-2">
                            {Close}
                          </CButton>
                        </Link>
                      </CCol>
                    )}
                  </CRow>
                )}
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <CModal
        visible={deleteModalVisible}
        alignment="center"
        onClose={() => setDeleteModalVisible(false)}
      >
        <CModalBody>
          {decision == 'approved' ? (
            <CRow className="justify-content-center successIconGif">
              {/* <CIcon icon={cilCheckCircle} size="7xl" /> */}
              <Image src={successIcon} alt="successIcon"></Image>
            </CRow>
          ) : decision == 'review' ? (
            <CRow className="justify-content-center pendingIconGif">
              {/* <CIcon icon={cilCommentBubble} size="7xl" /> */}
              <Image src={otherIcon} alt="changeIcon"></Image>
            </CRow>
          ) : (
            <CRow className="justify-content-center failedIconGif">
              {/* <CIcon icon={cibIfixit} size="7xl" /> */}
              <Image src={failedIcon} alt="failedIcon"></Image>
            </CRow>
          )}
          <CRow className="c-height"></CRow>
          <p className="delete-ask">Do you want to {decision} this record?</p>

          {/* Comment Box */}
          <CRow className="mb-3">
            {/* <CFormTextarea
              type="text"
              placeholder="Enter your comment"
              value={comment}
              onChange={handleCommentChange}
            ></CFormTextarea> */}

            <CCol className="d-grid mb-3">
              <CFormTextarea
                placeholder="Please add a comment..."
                value={comment}
                onChange={handleCommentChange}
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol xs={6} className="d-grid mb-3">
              <CButton
                className="btnCustom text-white"
                color="light"
                onClick={handleDecision} // Pass comment if needed
                disabled={decision === 'rejected' ? isConfirmDisabled : false} // Disable until comment is filled
              >
                {confirm}
              </CButton>
            </CCol>
            <CCol xs={6} className="d-grid mb-3">
              <CButton color="danger text-white" onClick={() => setDeleteModalVisible(false)}>
                {cancel}
              </CButton>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>
      <ToastNotification />
    </CContainer>
  )
}

export default OperatorConfigDecision
