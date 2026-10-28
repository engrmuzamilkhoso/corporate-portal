import FeeSlabComponent, { FeeSlabData } from '@/components/FeeSlabComponent'
import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import api from '@/utils/axios'
import { save } from '@/utils/crudBtnTexts'
import { formatDataList } from '@/utils/formatDataList'
import { mdrMediumOptions } from '@/utils/listExport'
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
  CMultiSelect,
  CRow,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const MdrFormComponent = ({
  makerCheckerEnabledStatus = true,
}: {
  makerCheckerEnabledStatus: boolean
}) => {
  const [checkerList, setCheckerList] = useState<{ label: string; value: string }[]>([])

  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [operators, setOperators] = useState([])
  const [banks, setBanks] = useState([])
  const [merchants, setMerchants] = useState([])
  const [MDRTypes, setMDRTypes] = useState([])
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
  })

  const [disabledUpdate, setDisabledUpdate] = useState(false)

  const { showToast } = useToastNotification()

  const userAuth = useTypedSelector(selectUserAuth)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      setLoader(true) // Start loading

      api
        .post('corporate/makerCheckerRole/list', {
          pageCode: 'MDRCREATE',
          role: 'Checker',
        })
        .then((response) => {
          console.log(response)
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          setLoader(false)
        })
      try {
        const [responseChecker, responseMaker] = await Promise.all([
          api.post('corporate/makerCheckerRole/checkerByScreen?pageCode=MDRCREATE'),
          api.post('corporate/makerCheckerRole/list', {
            search: userAuth.email,
            pageCode: 'MDRCREATE',
            role: 'Maker',
          }),
        ])

        // Handle first API response (checkerByScreen)
        if (responseChecker.status === 200) {
          const pageData = responseChecker.data
          const checkerListData = (pageData as any[])
            .filter((checker) => checker.userDetail.userID !== userAuth.id)
            .map((page) => ({
              label: page.userDetail.firstName + ' ' + page.userDetail.lastName,
              value: page.id,
            }))
          setCheckerList(checkerListData)
        }

        // Handle second API response (makerCheckerRole list)
        if (responseMaker.status === 200) {
          const maker = responseMaker.data.content[0].id
          setFormData((prevFormData) => ({ ...prevFormData, makerId: maker }))
        }
      } catch (error) {
        console.error('Error occurred:', error)
      } finally {
        setLoader(false) // Stop loading once API calls complete
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    fetchOperatorsAndBanks()
  }, [])

  const fetchOperatorsAndBanks = () => {
    setLoader(true)

    Promise.all([
      api.get('operator/getAllOperator?db=REMITTANCE'),
      api.post('bank/all'),
      api.post('/corporate/mdrRates/getAllMdrFeeTypes', {}),
    ])
      .then(([operatorResponse, bankResponse, MDRTypesResponse]) => {
        if (operatorResponse.status == 200) {
          setOperators(formatDataList(operatorResponse.data, (str) => str.toUpperCase()) as any)
        }
        if (bankResponse.status == 200) {
          setBanks(bankResponse.data)
        }
        if (MDRTypesResponse.status == 200) {
          const mdrTypesList = MDRTypesResponse.data.data.map((mdrType: any) => {
            const mdrTypeValue = mdrType.value
            return { ...mdrType, value: mdrTypeValue ?? mdrType.label }
          })
          setMDRTypes(mdrTypesList)
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
          setFormData((prevFormData) => ({
            ...prevFormData,
            merchant: '',
          }))
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
          setMDRTypes(mdrTypesList)
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
    const { name, value } = e.target
    if (name === 'value' && value < 0) {
      return // Ignore the change
    }
    if (name == 'productType') {
      setFormData({ ...formData, operatorsBank: '', merchant: '' })
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
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
    const checker = makerCheckerEnabledStatus ? checkerId !== '' : true
    
    const operatorsBankCheck = mdrMedium === 'operator' ? String(operatorsBank).trim() !== '' : true
    const merchantCheck = mdrMedium === 'merchant' ? merchant !== '' : true
    return (
      productType.trim() !== '' &&
      fieldName.trim() !== '' &&
      accountType.trim() !== '' &&
      operatorsBankCheck &&
      feeType.trim() !== '' &&
      value.trim() !== '' &&
      checker &&
      merchantCheck
    )
  }
  const handleSubmit = (e: any) => {
    e.preventDefault()
    const isFormValid = validateForm()

    if (!isFormValid) {
      setValidated(true)
      showToast('error', 'Please fill all required fields')
      return
    }
    setLoader(true)
    const mdrFormData = {
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
              .filter((feeSlab) => feeSlab.status !== 'new')
              .map((feeSlab) => ({ ...feeSlab, active: feeSlab.active ? 1 : 0 }))
          : null,
    }
    api
      .post('/corporate/mdrRates/save', mdrFormData)
      .then((res: any) => {
        console.log(res)
        const response = res.data
        if (response.status != '0000') {
          showToast('error', (response.message as string).replace(/-/g, ' '))
        } else {
          setDisabledUpdate(true)
          showToast('success', 'Success', {
            onClose: () => {
              router.push('/maker_checker/task-management')
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
    // Implement submission logic here
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
                      disabled={disabledUpdate}
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
                      disabled={disabledUpdate}
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
                      disabled={disabledUpdate}
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
                            setFormData((formData) => ({ ...formData, merchant: '' }))
                          }
                        }}
                        resetSelectionOnOptionsChange
                        className={validated && !formData.merchant ? 'is-invalid' : ''}
                        disabled={formData.productType == '' || disabledUpdate}
                      />
                      {/* <CFormSelect
                        name="merchant"
                        value={formData.merchant}
                        onChange={handleChange}
                        required
                        className={validated && !formData.merchant ? 'is-invalid' : ''}
                      >
                        <option value="">Select Merchant</option>
                        {merchants.map((merchant: { code: string; name: string }) => (
                          <option key={merchant.code} value={merchant.code}>
                            {merchant.code}-{merchant.name}
                          </option>
                        ))}
                      </CFormSelect> */}
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
                        className={validated && !formData.operatorsBank ? 'is-invalid' : ''}
                        disabled={formData.productType == '' || disabledUpdate}
                      >
                        <option value="">
                          {/* Select {formData.productType === 'Collection' ? 'Operators' : 'Banks'} */}
                          Select Operators
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
                      options={MDRTypes}
                      multiple={false}
                      allowCreateOptions
                      optionsStyle="text"
                      required
                      virtualScroller={true}
                      visibleItems={5}
                      onChange={(option: any) => {
                        if (option[0]) {
                          setFormData((form) => ({ ...form, fieldName: option[0]?.label }))
                        } else {
                          setFormData((form) => ({ ...form, fieldName: '' }))
                        }
                      }}
                      resetSelectionOnOptionsChange
                      className={validated && !formData.fieldName ? 'is-invalid' : ''}
                      disabled={
                        !(
                          formData.productType !== '' &&
                          (formData.merchant !== '' || formData.operatorsBank !== '')
                        ) || disabledUpdate
                      }
                    />
                  </CCol>

                  {makerCheckerEnabledStatus && (
                    <CCol>
                      <CFormLabel htmlFor="checkerId">Checker</CFormLabel>
                      <CFormSelect
                        name="checkerId"
                        value={formData.checkerId}
                        onChange={handleChange}
                        className={validated && !formData.checkerId ? 'is-invalid' : ''}
                        required
                        disabled={disabledUpdate}
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
                      className={validated && !formData.value ? 'is-invalid' : ''}
                      disabled={disabledUpdate}
                    />
                  </CCol>

                  <CCol md="6">
                    <CFormLabel htmlFor="feeType">Fee Type</CFormLabel>
                    <CFormSelect
                      name="feeType"
                      value={formData.feeType}
                      onChange={handleChange}
                      required
                      className={validated && !formData.feeType ? 'is-invalid' : ''}
                      disabled={disabledUpdate}
                    >
                      <option value="">Select Fee Type</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Fixed-Slab">Fixed-Slab</option>
                      <option value="Percentile">Percentile</option>
                      <option value="Percentile-Slab">Percentile-Slab</option>
                    </CFormSelect>
                  </CCol>
                </CRow>

                {formData.feeType == 'Fixed-Slab' || formData.feeType == 'Percentile-Slab' ? (
                  <FeeSlabComponent feeSlabs={feeSlabs} setFeeSlabs={setFeeSlabs} />
                ) : null}

                <CRow className="text-end">
                  <CCol>
                    <CButton
                      type="button"
                      color="primary btnCustom mt-4"
                      onClick={handleSubmit}
                      disabled={disabledUpdate}
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

export default MdrFormComponent
