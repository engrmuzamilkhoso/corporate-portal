import FeeSlabComponent, { FeeSlabData } from '@/components/FeeSlabComponent'
import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import api from '@/utils/axios'
import { Close, save } from '@/utils/crudBtnTexts'
import { formatDataList } from '@/utils/formatDataList'
import { mdrMediumOptions, mdrOptions } from '@/utils/listExport'
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
  CRow,
} from '@coreui/react-pro'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const MDRUpdateComponent = ({
  makerCheckerEnabledStatus = true,
}: {
  makerCheckerEnabledStatus: boolean
}) => {
  const [checkerList, setCheckerList] = useState<{ label: string; value: string }[]>([])

  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [operators, setOperators] = useState([])
  const [banks, setBanks] = useState([])
  const [merchants, setMerchants] = useState([])
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

  useEffect(() => {
    const fetchData = async () => {
      const id = searchParams.get('id') || ''
      console.log(id)
      setLoader(true)
      await api
        .post(`corporate/mdrRates/getMdrById/${id}`)
        .then((response: any) => {
          console.log('response: ', response)
          if (response.status == 200 && response.data.status == '0000') {
            const apiData = response.data.data
            setFormData({ ...apiData, state: 'Approved' })

            // setDisabled(formData.state == 'Pending')
            setFeeSlabs(apiData.slabs.map((slab: FeeSlabData) => ({ ...slab, status: 'saved' })))
          }
        })
        .catch((err: any) => {
          console.error('Error fetching fee template:', err)
        })
        .finally(() => {
          setLoader(false)
        })
    }

    // Call the async function
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
          const merchantList = (responseMerchant.data as []).map((merchant: any) => ({
            code: merchant.id,
            name: merchant.firstName + ' ' + merchant.lastName,
            label: merchant.id + ' - ' + merchant.firstName + ' ' + merchant.lastName,
            value: merchant.id,
          }))
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

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    // Handle form submission logic

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
          showToast('success', 'Success', {
            onClose: () => {
              router.push('/fee_management/list')
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
      mdrType,
      accountType,
      operatorsBank,
      feeType,
      checkerId,
      value,
      merchant,
      mdrMedium,
      makerCheckerStatus,
    } = formData

    const operatorsBankCheck =
      formData.mdrType === 'Operator' || formData.mdrType === 'Banks'
        ? String(operatorsBank).trim() !== ''
        : true
    const merchantCheck = mdrMedium === 'merchant' ? merchant !== '' : true
    // Example validation: Check if required fields are filled
    return (
      productType.trim() !== '' &&
      mdrType.trim() !== '' &&
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
                      <CBadge className="failedStatus px-4 py-2">{formData.mdrStatus?? "Inactive"}</CBadge>
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
                      disabled
                      className={validated && !formData.productType ? 'is-invalid' : ''}
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
                      disabled
                      className={validated && !formData.accountType ? 'is-invalid' : ''}
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
                      disabled
                      className={validated && !formData.mdrMedium ? 'is-invalid' : ''}
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
                      <CFormSelect
                        name="merchant"
                        value={formData.merchant}
                        required
                        className={validated && !formData.merchant ? 'is-invalid' : ''}
                        disabled
                      >
                        <option value="">Select Merchant</option>
                        {merchants.map((merchant: { code: string; name: string }) => (
                          <option key={merchant.code} value={merchant.code}>
                            {merchant.name}
                          </option>
                        ))}
                      </CFormSelect>
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
                        required
                        disabled
                        className={validated && !formData.operatorsBank ? 'is-invalid' : ''}
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
                    <CFormInput
                      type="text"
                      name="fieldName"
                      value={formData.fieldName}
                      disabled
                      required
                      onChange={handleChange}
                      className={validated && !formData.fieldName ? 'is-invalid' : ''}
                    />
                  </CCol>
                  {/* <CCol md="6">
                    <CFormLabel htmlFor="mdrType">MDR Type</CFormLabel>
                    <CFormSelect
                      name="mdrType"
                      value={formData.mdrType}
                      onChange={handleChange}
                      required
                      disabled
                      className={validated && !formData.mdrType ? 'is-invalid' : ''}
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
                      className={validated && !formData.checkerId ? 'is-invalid' : ''}
                      required
                      disabled
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
                      disabled
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
                      disabled
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

                {/* {makerCheckerEnabledStatus && (
                  <CRow className="mb-3">
                    <CCol>
                      <CFormLabel htmlFor="checkerId">Checker</CFormLabel>
                      <CFormSelect
                        name="checkerId"
                        value={formData.checkerId}
                        onChange={handleChange}
                        className={validated && !formData.checkerId ? 'is-invalid' : ''}
                        required
                        disabled
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
                )} */}

                {formData.feeType == 'Fixed-Slab' || formData.feeType == 'Percentile-Slab' ? (
                  <FeeSlabComponent
                    editable={false}
                    feeSlabs={feeSlabs}
                    setFeeSlabs={setFeeSlabs}
                  />
                ) : null}
                {formData.comments && formData.comments.length != 0 && (
                  <CRow>
                    <CFormLabel htmlFor="value">Comments</CFormLabel>
                    <CCol className="d-grid mb-3">
                      <CFormTextarea
                        placeholder="Please add a comment..."
                        value={formData.comments}
                        disabled
                      />
                    </CCol>
                  </CRow>
                )}
                {/* {formData.state === 'Pending' && (
                  <CRow className="text-end">
                    <CCol>
                      <CButton type="button" color="primary btnCustom mt-4" onClick={handleSubmit}>
                        {save}
                        <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                      </CButton>
                    </CCol>
                  </CRow>
                )} */}

                <CRow className="text-end">
                  <CCol>
                    <Link href="/mdr/list" passHref>
                      <CButton color="danger" className="text-white me-2">
                        {Close}
                      </CButton>
                    </Link>
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

export default MDRUpdateComponent
