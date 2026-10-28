import FeeSlabComponent, { FeeSlabData } from '@/components/FeeSlabComponent'
import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import api from '@/utils/axios'
import { cancel, save, update } from '@/utils/crudBtnTexts'
import { mdrMediumOptions, templateApplyStatusList } from '@/utils/listExport'
import { cibIfixit, cilBan } from '@coreui/icons'
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
  CModal,
  CModalBody,
  CMultiSelect,
  CRow,
} from '@coreui/react-pro'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import Image from 'next/image'
import successIcon from '@/public/images/ss.gif'
import failedIcon from '@/public/images/ff.gif'
import otherIcon from '@/public/images/alert.gif'
import { formatDataList } from '@/utils/formatDataList'

const MDRStatusUpdateComponent = ({
  makerCheckerEnabledStatus = true,
}: {
  makerCheckerEnabledStatus: boolean
}) => {
  const [MDRStatusObject, setMDRStatusObject] = useState<{
    mdrStatus: 'activate' | 'deactivate' | 'delete' | 'hold' | null
    modalVisibility: boolean
    disableSubmit: boolean
  }>({
    mdrStatus: null,
    modalVisibility: false,
    disableSubmit: true,
  })

  const [checkerList, setCheckerList] = useState<{ label: string; value: string }[]>([])

  const [mdrTypeOptions, setMdrTypeOptions] = useState<any[]>([])
  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [operators, setOperators] = useState([])
  const [banks, setBanks] = useState([])
  const [merchants, setMerchants] = useState([])
  const [disabledButton, setDisabledButton] = useState(true)
  const [disableField, setDisableField] = useState(false)
  const [feeSlabs, setFeeSlabs] = useState<FeeSlabData[]>([
    {
      minValue: '',
      maxValue: '',
      fee: '',
      active: false,
      status: 'new',
    },
  ])
  const [formData, setFormData] = useState({
    id: '',
    productType: '',
    mdrType: '',
    accountType: '',
    operatorsBank: '',
    value: '0.00',
    feeType: '',
    checkerId: '',
    makerId: '',
    fieldName: '',
    status: true,
    state: '',
    mdrMedium: '',
    mdrFeeType: 'operator',
    merchant: '',
    comments: '',
    makerCheckerStatus: '',
    mdrStatus: '',
  })

  const searchParams = useSearchParams()
  const router = useRouter()

  const fetchData = async () => {
    const id = searchParams.get('id') || ''
    console.log(id)
    setLoader(true)

    Promise.all([
      api.post(`corporate/mdrRates/getMdrById/${id}`),
      api.post('/corporate/mdrRates/getAllMdrFeeTypes', {}),
    ])
      .then(([MDRResponse, MDRTypesResponse]) => {
        var mdrTypeOptionsLocal
        if (MDRTypesResponse.status == 200) {
          const mdrTypesList = MDRTypesResponse.data.data.map((mdrType: any) => {
            const mdrTypeValue = mdrType.value
            return { ...mdrType, value: mdrTypeValue ?? mdrType.label }
          })
          mdrTypeOptionsLocal = mdrTypesList
          // setMdrTypeOptions(mdrTypesList)
        }
        console.log('response: ', MDRResponse)
        if (MDRResponse.status == 200 && MDRResponse.data.status == '0000') {
          const apiData = MDRResponse.data.data
          setFormData(apiData)
          setMDRStatusObject({
            mdrStatus: apiData.mdrStatus,
            modalVisibility: false,
            disableSubmit: false,
          })

          let checkOptionAvailable = false

          const newMDR = mdrTypeOptionsLocal.map((mdrOption: { value: any }) => {
            if (mdrOption.value == apiData.fieldName) {
              checkOptionAvailable = true
              return { ...mdrOption, selected: true }
            }
            return mdrOption
          })

          if (!checkOptionAvailable) {
            newMDR.push({ value: apiData.fieldName, label: apiData.fieldName, selected: true })
          }

          console.log('newMDR: ', newMDR)

          setMdrTypeOptions(newMDR)

          const slabs: FeeSlabData[] = apiData.slabs
            ? apiData.slabs.map((slab: FeeSlabData, index: number, slabs: any) => ({
                ...slab,
                status: 'saved',
              }))
            : null

          const newSlab: FeeSlabData = {
            minValue: '',
            maxValue: '',
            fee: '',
            active: false,
            status: 'new',
          }
          setFeeSlabs(slabs ? slabs.concat(newSlab) : [newSlab])
        }
      })
      .catch((err: any) => {
        console.error('Error fetching fee template and MDRTypes:', err)
      })
      .finally(() => {
        setLoader(false)
      })
  }

  useEffect(() => {
    fetchData()
  }, [searchParams])

  const userAuth = useTypedSelector(selectUserAuth)
  const { showToast } = useToastNotification()

  useEffect(() => {
    api
      .post('corporate/makerCheckerRole/checkerByScreen?pageCode=MDRCREATE')
      .then((response: any) => {
        console.log(response)
        if (response.status == 200) {
          const pageData = response.data

          const checkerListData = (pageData as any[])
            .filter((checker) => checker.userDetail.userID != userAuth.id)
            .map((page: any) => ({
              label: page.userDetail.firstName + ' ' + page.userDetail.lastName,
              value: page.id,
            }))
          setCheckerList(checkerListData)
        }
      })
      .catch((error: any) => {
        console.error(error)
      })
      .finally(() => {
        setLoader(false)
      })
  }, [])

  useEffect(() => {
    fetchOperatorsAndBanks()
  }, [])

  const fetchOperatorsAndBanks = () => {
    setLoader(true)

    Promise.all([api.get('operator/getAllOperator?db=DISB'), api.post('bank/all')])
      .then(([operatorResponse, bankResponse]) => {
        if (operatorResponse.status == 200) {
          setOperators(formatDataList(operatorResponse.data, (str) => str.toUpperCase()) as any)
        }
        if (bankResponse.status == 200) {
          setBanks(bankResponse.data)
        }
      })
      .catch((err) => {
        console.error('Error fetching Bank and Operators:', err)
      })
      .finally(() => {
        setLoader(false)
      })
  }

  const fetchOperatorsAndMerchants = () => {
    let operatorsApi = ''
    let typeIds = ''
    if (formData.productType === 'Collection') {
      operatorsApi = '/operator/getAllCollectionOperators'
      typeIds = '1,2,3'
    } else if (formData.productType === 'Disbursement') {
      operatorsApi = '/operator/getAllOperator?db=DISB'
      typeIds = '4'
    } else {
      operatorsApi = '/operator/getAllOperator?db=REMITTANCE'
      typeIds = '5'
    }
    setLoader(true)

    Promise.all([
      api.get(`merchant/v2/getAllMerchants?accountRoute=SP&region=Pakistan&typeIds=${typeIds}`),
      api.get(operatorsApi),
    ])
      .then(([responseMerchant, operatorResponse]) => {
        if (responseMerchant.status === 200) {
          const merchantList = (responseMerchant.data as []).map((merchant: any) => {
            const merchantSelect = {
              code: merchant.id,
              name: merchant.firstName + ' ' + merchant.lastName,
              label: merchant.id + ' - ' + merchant.firstName + ' ' + merchant.lastName,
              value: merchant.id,
              selected: merchant.id == formData.merchant,
            }
            return merchantSelect
          })
          setMerchants(merchantList as [])
        }
        if (operatorResponse.status == 200) {
          setOperators(formatDataList(operatorResponse.data, (str) => str.toUpperCase()) as any)
        }
      })
      .catch((err) => {
        console.error('Error fetching Bank and Operators:', err)
      })
      .finally(() => {
        setLoader(false)
      })
  }

  useEffect(() => {
    fetchOperatorsAndMerchants()
  }, [formData.productType])

  const fetchMDRFeeTypes = () => {
    setLoader(true)

    api
      .get(
        `/corporate/mdrRates/get/fee-types?productType=${formData.productType}&operator=${formData.operatorsBank}&merchant=${formData.merchant}`,
      )
      .then((MDRTypesResponse) => {
        if (MDRTypesResponse.status == 200) {
          console.log(MDRTypesResponse)

          const mdrTypesList = MDRTypesResponse.data.data.map((mdrType: any) => {
            const mdrTypeValue = mdrType.value
            const selected = mdrType.value == formData.fieldName
            return { ...mdrType, value: mdrTypeValue ?? mdrType.label, selected }
          })
          setMdrTypeOptions(mdrTypesList)
        }
      })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
        setLoader(false)
      })
  }

  useEffect(() => {
    if (formData.productType && (formData.operatorsBank || formData.merchant)) {
      console.log('getting')

      fetchMDRFeeTypes()
    }
  }, [formData.productType, formData.operatorsBank, formData.merchant])

  const handleChange = (e: any) => {
    setDisabledButton(false)
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleMDRApplyStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as 'activate' | 'deactivate' | 'delete' | 'hold' | ''
    setMDRStatusObject((MDRStatusObject) => ({
      ...MDRStatusObject,
      mdrStatus: selectedValue || null,
      disableSubmit: !selectedValue,
    }))
  }

  const handleStatusDecision = () => {
    setLoader(true)
    const id = searchParams.get('id')
    api
      .post('/corporate/feesTemplate/updateStatus', {
        id,
        template_status: MDRStatusObject.mdrStatus,
        module: 'mdr',
      })
      .then((response) => {
        if (response.status == 200 && response.data.status == '0000') {
          showToast('success', 'MDR Status Updated Successfully')
          fetchData()
        } else if (response.status == 200 && response.data.status != '0000') {
          throw new Error((response.data.message as string).replace(/-/g, ' '))
        }
      })
      .catch((error) => {
        console.error('Error :', error)
        showToast('error', 'Failed to update MDR Status')
      })
      .finally(() => {
        setMDRStatusObject((MDRStatusObject) => ({
          ...MDRStatusObject,
          modalVisibility: false,
        }))
        setLoader(false)
      })
  }

  const onSlabEdit = () => {
    setDisabledButton(false)
  }

  const handleSubmit = () => {
    // Handle form submission logic
    setDisabledButton(false)

    const isFormValid = validateForm()

    if (!isFormValid) {
      setValidated(true)
      showToast('error', 'Please fill all required fields')
      return
    }

    setLoader(true)
    const templateData = {
      ...formData,
      operatorsBank: String(formData.operatorsBank),
      operatorId:
        formData.mdrMedium === 'operator'
          ? String(
              (operators.find((operator: any) => operator.name === formData.operatorsBank) as any)
                .code,
            )
          : null,
      slabs:
        formData.feeType == 'Fixed-Slab' || formData.feeType == 'Percentile-Slab'
          ? feeSlabs
              .filter((slab) => slab.status === 'saved')
              .map((feeSlab) => ({ ...feeSlab, active: feeSlab.active ? 1 : 0 }))
          : undefined,
    }

    api
      .post(`/corporate/mdrRates/update/${templateData.id}`, templateData)
      .then((res: any) => {
        console.log(res)
        const response = res.data
        if (response.status != '0000') {
          showToast('error', (response.message as string).replace(/-/g, ' '))
        } else {
          setDisabledButton(true)
          setDisableField(true)
          showToast('success', 'Success', {
            onClose: () => {
              router.push('/mdr/list')
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

  const validateForm = () => {
    const {
      productType,
      fieldName,
      accountType,
      operatorsBank,
      feeType,
      checkerId,
      value,
      merchant,
      mdrMedium,
    } = formData
    const operatorsBankCheck = mdrMedium === 'operator' ? String(operatorsBank).trim() !== '' : true
    const merchantCheck = mdrMedium === 'merchant' ? merchant !== '' : true
    // Example validation: Check if required fields are filled
    return (
      productType.trim() !== '' &&
      fieldName.trim() !== '' &&
      accountType.trim() !== '' &&
      operatorsBankCheck &&
      feeType.trim() !== '' &&
      value.trim() !== '' &&
      checkerId !== '' &&
      merchantCheck
    )
  }

  return (
    <CContainer md className="px-4 ">
      <Loader isLoading={loader} />
      <CRow>
        <CCol xl={4}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h2 className="formTitle">MDR Rates Form</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={8}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <CRow className="mb-3">
                <CCol lg={6} className="d-flex">
                  <CFormLabel htmlFor="Template Status" className="my-auto me-2">
                    Template Status
                  </CFormLabel>
                  <div>
                    {formData.makerCheckerStatus === 'Pending' ? (
                      <CBadge color="success pendingStatus px-4 py-2">Pending</CBadge>
                    ) : formData.makerCheckerStatus == 'Approved' ? (
                      <CBadge color="success successStatus px-4 py-2">Approved</CBadge>
                    ) : formData.makerCheckerStatus == 'Review' ? (
                      <CBadge color="success reviewStatus px-4 py-2">In Review</CBadge>
                    ) : (
                      // </CRow>
                      <CBadge color="success failedStatus px-4 py-2">
                        {formData.makerCheckerStatus}
                      </CBadge>
                    )}
                  </div>
                </CCol>
                <CCol lg={6} className="d-flex justify-content-end">
                  <CFormLabel htmlFor="Application Status" className="my-auto me-2">
                    Application Status
                  </CFormLabel>
                  <div>
                    {formData?.mdrStatus === 'activate' ? (
                      <CBadge className="successStatus px-4 py-2">Active</CBadge>
                    ) : formData?.mdrStatus === 'inactive' ? (
                      <CBadge className="otherStatus px-4 py-2">Inactive</CBadge>
                    ) : formData?.mdrStatus === 'hold' ? (
                      <CBadge className="pendingStatus px-4 py-2">On Hold</CBadge>
                    ) : formData?.mdrStatus === 'delete' ? (
                      <CBadge className="failedStatus px-4 py-2">Deleted</CBadge>
                    ) : (
                      <CBadge className="failedStatus px-4 py-2">{formData.mdrStatus}</CBadge>
                    )}
                  </div>
                </CCol>
              </CRow>

              <CForm>
                <CRow className="mb-3">
                  <CCol md="6">
                    <CFormLabel htmlFor="productType">Product Type</CFormLabel>
                    <CFormSelect
                      name="productType"
                      value={formData.productType}
                      onChange={handleChange}
                      required
                      className={validated && !formData.productType ? 'is-invalid' : ''}
                      disabled
                    >
                      <option value="">Select Product Type</option>
                      <option value="Collection">Collection</option>
                      <option value="Disbursement">Disbursement</option>
                      <option value="Remittance">Remittance</option>
                    </CFormSelect>
                  </CCol>

                  <CCol md="6">
                    <CFormLabel htmlFor="accountType">Account Type</CFormLabel>
                    <CFormSelect
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleChange}
                      required
                      className={validated && !formData.accountType ? 'is-invalid' : ''}
                      disabled
                    >
                      <option value="">Select Account Type</option>
                      <option value="MG">MG</option>
                      <option value="SP">SP</option>
                      {/* <option value="Pex">Pex</option> */}
                    </CFormSelect>
                  </CCol>
                </CRow>
                <CRow className="mb-3">
                  <CCol md="6">
                    <CFormLabel htmlFor="mdrMedium">MDR Medium</CFormLabel>
                    <CFormSelect
                      name="mdrMedium"
                      value={formData.mdrMedium}
                      onChange={handleChange}
                      required
                      className={validated && !formData.mdrMedium ? 'is-invalid' : ''}
                      disabled
                    >
                      <option value="">Select MDR Medium</option>
                      {mdrMediumOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  {formData.mdrMedium === 'merchant' && (
                    <CCol md="6">
                      <CFormLabel htmlFor="merchant">Merchants</CFormLabel>
                      <CMultiSelect
                        name="merchant"
                        options={merchants}
                        multiple={false}
                        optionsStyle="text"
                        required
                        virtualScroller={true}
                        visibleItems={5}
                        onChange={(option) => {
                          if (option[0]) {
                            setFormData((formData) => ({
                              ...formData,
                              merchant: option[0].value as string,
                            }))
                          } else {
                            setFormData((formData) => ({
                              ...formData,
                              merchant: '',
                            }))
                          }
                        }}
                        disabled={disableField}
                        className={validated && !formData.merchant ? 'is-invalid' : ''}
                      />
                    </CCol>
                  )}

                  {formData.mdrMedium === 'operator' && (
                    <CCol md="6">
                      <CFormLabel htmlFor="operatorsBank">
                        {/* {formData.productType === 'Collection' ? 'Operators' : 'Banks'} */}
                        Operators
                      </CFormLabel>
                      <CFormSelect
                        name="operatorsBank"
                        value={formData.operatorsBank}
                        onChange={handleChange}
                        required
                        disabled={disableField}
                        className={validated && !formData.operatorsBank ? 'is-invalid' : ''}
                      >
                        <option value="">
                          Select Operators
                          {/* Select {formData.productType === 'Collection' ? 'Operators' : 'Banks'} */}
                        </option>
                        {operators.map((operator: { id: string; name: string }) => (
                          <option key={operator.id} value={operator.name}>
                            {operator.name}
                          </option>
                        ))}
                        {/* {formData.productType === 'Collection'
                          ? operators.map((operator: { id: string; name: string }) => (
                              <option key={operator.id} value={operator.id}>
                                {operator.name}
                              </option>
                            ))
                          : banks.map((bank: { code: string; name: string }) => (
                              <option key={bank.code} value={bank.code}>
                                {bank.name}
                              </option>
                            ))} */}
                      </CFormSelect>
                    </CCol>
                  )}
                </CRow>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="fieldName">MDR Title</CFormLabel>
                    <CMultiSelect
                      name="fieldName"
                      placeholder=" "
                      options={mdrTypeOptions}
                      multiple={false}
                      allowCreateOptions
                      optionsStyle="text"
                      required
                      virtualScroller={true}
                      visibleItems={5}
                      onChange={(option: any) => {
                        if (option[0]) {
                          setFormData((form) => ({ ...form, fieldName: option[0].label }))
                        } else {
                          setFormData((form) => ({ ...form, fieldName: '' }))
                        }
                      }}
                      // resetSelectionOnOptionsChange
                      className={validated && !formData.fieldName ? 'is-invalid' : ''}
                      disabled={
                        !(
                          formData.productType !== '' &&
                          (formData.merchant !== '' || formData.operatorsBank !== '')
                        ) || disableField
                      }
                    />
                  </CCol>
                  {/* <CCol md="6">
                    <CFormLabel htmlFor="mdrType">MDR Type</CFormLabel>
                    <CFormSelect
                      name="mdrType"
                      value={formData.mdrType}
                      onChange={handleChange}
                      required
                      className={validated && !formData.mdrType ? 'is-invalid' : ''}
                      disabled
                    >
                      <option value="">Select MDR Type</option>
                      {mdrOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol> */}

                  <CCol>
                    <CFormLabel htmlFor="checkerId">Checker</CFormLabel>
                    <CFormSelect
                      name="checkerId"
                      value={formData.checkerId}
                      onChange={handleChange}
                      disabled={disableField}
                      className={validated && !formData.checkerId ? 'is-invalid' : ''}
                      required
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

                <CRow className="mb-3">
                  <CCol md="6">
                    <CFormLabel htmlFor="value">Value</CFormLabel>
                    <CFormInput
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                      disabled={disableField}
                      className={validated && !formData.value ? 'is-invalid' : ''}
                    />
                  </CCol>

                  <CCol md="6">
                    <CFormLabel htmlFor="feeType">Fee Type</CFormLabel>
                    <CFormSelect
                      name="feeType"
                      value={formData.feeType}
                      onChange={handleChange}
                      required
                      disabled={disableField}
                      className={validated && !formData.feeType ? 'is-invalid' : ''}
                    >
                      <option value="">Select Fee Type</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Fixed-Slab">Fixed-Slab</option>
                      <option value="Percentile">Percentile</option>
                      <option value="Percentile-Slab">Percentile-Slab</option>
                    </CFormSelect>
                  </CCol>
                </CRow>
                {/* 
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="checkerId">Checker</CFormLabel>
                    <CFormSelect
                      name="checkerId"
                      value={formData.checkerId}
                      onChange={handleChange}
                      className={validated && !formData.checkerId ? 'is-invalid' : ''}
                      required
                      disabled={disabled}
                    >
                      <option value="">Select Checker</option>
                      {checkerList.map((checker) => (
                        <option key={checker.value} value={checker.value}>
                          {checker.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow> */}
                {formData.feeType == 'Fixed-Slab' || formData.feeType == 'Percentile-Slab' ? (
                  <FeeSlabComponent
                    feeSlabs={feeSlabs}
                    setFeeSlabs={setFeeSlabs}
                    onSlabEdit={onSlabEdit}
                  />
                ) : null}
                <CRow className="">
                  <CCol className="crud-btns">
                    <CButton
                      size="sm"
                      type="button"
                      color="outline-info mt-4"
                      disabled={disableField}
                      onClick={() => {
                        setMDRStatusObject((MDRStatusObject) => ({
                          ...MDRStatusObject,
                          modalVisibility: true,
                        }))
                      }}
                    >
                      <CIcon icon={cilBan} size="sm" /> Change Application Status
                    </CButton>
                  </CCol>
                  <CCol className="crud-btns text-end">
                    <CButton
                      size="sm"
                      type="button"
                      color="danger text-white mt-4"
                      onClick={() => {
                        router.push('/mdr/list')
                      }}
                    >
                      {cancel}
                    </CButton>
                    <CButton
                      size="sm"
                      type="button"
                      color="primary btnCustom mt-4"
                      onClick={handleSubmit}
                      disabled={disabledButton}
                    >
                      {update}
                      <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                    </CButton>
                  </CCol>

                  {/* {formData.makerCheckerStatus == 'Approved' ? (
                    <CCol className="crud-btns text-end">
                      <CButton
                        size="sm"
                        type="button"
                        color="primary btnCustom mt-4"
                        onClick={() => {
                          router.push('/fee_management/list')
                        }}
                      >
                        {cancel}
                      </CButton>
                      <CButton
                        size="sm"
                        type="button"
                        color="danger text-light mt-4"
                        onClick={() => handleSubmit()}
                      >
                        <CIcon icon={cilBan} size="sm" /> {deactivate}
                      </CButton>
                      <CButton
                        size="sm"
                        type="button"
                        color="danger text-light mt-4"
                        onClick={() => {
                          setChangeStatusModalVisibility(true)
                        }}
                      >
                        <CIcon icon={cilBan} size="sm" /> Status
                      </CButton>
                    </CCol>
                  ) : (
                    <CCol className="crud-btns">
                      <CButton size="sm" className="text-light" type="button" color="danger">
                        Status : Deactivated <i className="bi bi-x-lg"></i>
                      </CButton>
                    </CCol>
                  )} */}
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal
        visible={MDRStatusObject.modalVisibility}
        alignment="center"
        onClose={() =>
          setMDRStatusObject((MDRStatusObject) => ({
            ...MDRStatusObject,
            modalVisibility: false,
          }))
        }
      >
        <CModalBody>
          <CRow className="justify-content-center pendingIconGif">
            {/* <CIcon icon={cibIfixit} size="5xl" /> */}
            <Image src={otherIcon} alt="changeIcon"></Image>
          </CRow>

          <CRow className="c-height"></CRow>
          <p className="delete-ask">Change Application Status</p>

          <CRow className="c-height">
            <CCol>
              <CFormSelect
                id="mdrStatus"
                name="mdrStatus"
                value={MDRStatusObject.mdrStatus || ''}
                onChange={handleMDRApplyStatusChange}
              >
                <option value="">Select Status</option>
                {templateApplyStatusList.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow className="c-height">
            <CCol xs={6} className="d-grid mb-3">
              <CButton
                size="sm"
                type="button"
                color="primary btnCustom mt-2 py-2"
                onClick={handleStatusDecision}
                disabled={MDRStatusObject.disableSubmit}
              >
                {save}
              </CButton>
            </CCol>
            <CCol xs={6} className="d-grid mb-3">
              <CButton
                size="sm"
                type="button"
                color="danger text-light mt-2 py-2"
                onClick={() => {
                  setMDRStatusObject((MDRStatusObject) => ({
                    ...MDRStatusObject,
                    modalVisibility: false,
                  }))
                }}
              >
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

export default MDRStatusUpdateComponent
