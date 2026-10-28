'use client'
import FeeSlabComponent, { FeeSlabData } from '@/components/FeeSlabComponent'
import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import api from '@/utils/axios'
import { approve, cancel, Close, confirm, inreview, reject } from '@/utils/crudBtnTexts'
import { mdrMediumOptions, mdrOptions } from '@/utils/listExport'
import { TaskStatus } from '@/utils/status.enum'
import { cibIfixit, cilCheckAlt, cilCheckCircle, cilCommentBubble, cilList } from '@coreui/icons'
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
  CRow,
} from '@coreui/react-pro'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import successIcon from '@/public/images/ss.gif'
import failedIcon from '@/public/images/ff.gif'
import otherIcon from '@/public/images/alert.gif'
import { formatDataList } from '@/utils/formatDataList'

const MDRComponent = ({ isDecisionDisabled }: { isDecisionDisabled: boolean }) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [decision, setDecision] = useState<'Approved' | 'Rejected' | 'Review' | ''>('')
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
  })

  const [operators, setOperators] = useState([])
  const [banks, setBanks] = useState([])

  const [checkerList, setCheckerList] = useState<{ label: string; value: string }[]>([])

  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)
  const [comment, setComment] = useState('')
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
    setIsConfirmDisabled(e.target.value.trim() === '') // Disable if comment is empty or whitespace
  }

  useEffect(() => {
    fetchOperatorsAndBanks()
  }, [])

  const fetchOperatorsAndBanks = () => {
    setLoader(true)

    Promise.all([api.get('operator/getAllOperator?db=DISB'), api.post('bank/all')])
      .then(([operatorResponse, bankResponse]) => {
        if (operatorResponse.status == 200) {
          setOperators(formatDataList(operatorResponse.data, str => str.toUpperCase()) as any)
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
          setOperators(formatDataList(operatorResponse.data, str => str.toUpperCase()) as any)
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

  const handleDecision = () => {
    setDeleteModalVisible(false)
    setLoader(true)
    const id = searchParams.get('id')
    api
      .post(`/corporate/mdrRates/decisionMdrById/${formData.id}`, {
        state: decision,
        comments: comment,
      })
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.error('Error fetching data:', error)
      })
      .finally(() => {
        fetchData()
        setLoader(false)
        showToast('success', 'Task has been ' + decision + ' successfully')
      })
  }
  const fetchData = async () => {
    const id = searchParams.get('id') || ''
    setLoader(true)
    await api
      .post(`corporate/mdrRates/getMdrById/${id}`)
      .then((response: any) => {
        console.log('response: ', response)
        if (response.status == 200 && response.data.status == '0000') {
          const apiData = response.data.data
          setFormData(apiData)
          const slabs: FeeSlabData[] = apiData.slabs
            ? apiData.slabs.map((slab: FeeSlabData, index: number, slabs: any) => ({
                ...slab,
                status: 'saved',
              }))
            : null
          setFeeSlabs(slabs)
        }
      })
      .catch((err: any) => {
        console.error('Error fetching fee template:', err)
      })
      .finally(() => {
        setLoader(false)
      })
  }
  useEffect(() => {
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

          const checkerListData = (pageData as any[]).map((page: any) => ({
            label: page.userDetail.firstName + ' ' + page.userDetail.lastName,
            value: page.id,
          }))
          setCheckerList(checkerListData)
          console.log(checkerListData)
        }
      })
      .catch((error: any) => {
        console.error(error)
      })
      .finally(() => {
        setLoader(false)
      })
  }, [])

  const handleSubmit = (param: any) => {
    setDecision(param)
    setDeleteModalVisible(true)
  }

  // @ts-ignore
  // @ts-ignore
  return (
    <CContainer md className="px-4 ">
      <Loader isLoading={loader} />
      <CRow>
        <CCol xl={4}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h2 className="formTitle">Task Management </h2>
              <p className="formDescription">Checker Decision Form</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={8}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <CRow className="mb-3">
                <CCol lg={12} className="d-flex">
                  <CFormLabel htmlFor="Template Status" className="my-auto me-2">
                    Template Status
                  </CFormLabel>
                  <div>
                    {formData.state === 'Pending' ? (
                      <CBadge color="success pendingStatus px-4 py-2">Pending</CBadge>
                    ) : formData.state == 'Approved' ? (
                      <CBadge color="success successStatus px-4 py-2">Approved</CBadge>
                    ) : formData.state == 'Review' ? (
                      <CBadge color="success reviewStatus px-4 py-2">In Review</CBadge>
                    ) : (
                      // </CRow>
                      <CBadge color="success failedStatus px-4 py-2">{formData.state}</CBadge>
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
                  {/* Conditional sections */}
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
                        {operators.map((operator: { id: string; name: string }) => (
                          <option key={operator.id} value={operator.name}>
                            {operator.name}
                          </option>
                        ))}
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
                      required
                      className={validated && !formData.fieldName ? 'is-invalid' : ''}
                      disabled
                    />
                  </CCol>
                  {/* <CCol md="6">
                    <CFormLabel htmlFor="mdrType">MDR Type</CFormLabel>
                    <CFormSelect
                      name="mdrType"
                      value={formData.mdrType}
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
                      placeholder="0.00"
                      required
                      className={validated && !formData.value ? 'is-invalid' : ''}
                      disabled
                    />
                  </CCol>

                  <CCol md="6">
                    <CFormLabel htmlFor="feeType">Fee Type</CFormLabel>
                    <CFormSelect
                      name="feeType"
                      value={formData.feeType}
                      required
                      className={validated && !formData.feeType ? 'is-invalid' : ''}
                      disabled
                    >
                      <option value="">Select Fee Type</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Fixed-Slab">Fixed-Slab</option>
                      <option value="Percentile">Percentile</option>
                      <option value="Percentile-Slab">Percentile-Slab</option>
                    </CFormSelect>
                  </CCol>
                </CRow>

                {/* <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="checkerId">Checker</CFormLabel>
                    <CFormSelect
                      name="checkerId"
                      value={formData.checkerId}
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
                </CRow> */}
                {formData.feeType == 'Fixed-Slab' || formData.feeType == 'Percentile-Slab' ? (
                  <FeeSlabComponent
                    editable={false}
                    feeSlabs={feeSlabs}
                    setFeeSlabs={setFeeSlabs}
                  />
                ) : null}

                {!isDecisionDisabled && (
                  <CRow className="text-end">
                    {formData.state.toLocaleLowerCase() == TaskStatus.Pending ? (
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
                    ) : formData.state.toLocaleLowerCase() == TaskStatus.Approved ? (
                      <CCol className="crud-btns">
                        <Link href="/maker_checker/task-management" passHref>
                          <CButton color="danger" className="text-white me-2">
                            {Close}
                          </CButton>
                        </Link>
                      </CCol>
                    ) : formData.state.toLocaleLowerCase() == TaskStatus.Review ? (
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
                {/* <CRow className="text-end">
                  {formData.state == 'Pending' ? (
                    <CCol className="crud-btns">
                      <CButton
                        size="sm"
                        type="button"
                        color="primary btnCustom mt-4"
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
                        color="warning text-light mt-4"
                        onClick={() => handleSubmit('Review')}
                      >
                        {inreview} <CIcon icon={cilCommentBubble} />
                      </CButton>
                    </CCol>
                  ) : formData.state == 'Approved' ? (
                    <CCol className="crud-btns">
                      <CButton type="button" color="success text-light">
                        Status : Approved <i className="bi bi-check2-circle"></i>
                      </CButton>
                    </CCol>
                  ) : formData.state == 'Review' ? (
                    // <CRow>
                    <>
                      <CCol className="crud-btns text-start">
                        <CButton type="button" color="warning" className="text-light">
                          Status : In Review <CIcon icon={cilCommentBubble} />
                        </CButton>
                      </CCol>
                    </>
                  ) : (
                    // </CRow>
                    <CCol className="crud-btns">
                      <CButton className="text-light" type="button" color="danger">
                        Status : {formData.state} <i className="bi bi-x-lg"></i>
                      </CButton>
                    </CCol>
                  )}
                </CRow> */}
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
          {decision == 'Approved' ? (
            <CRow className="justify-content-center successIconGif">
              {/* <CIcon icon={cilCheckCircle} size="7xl" /> */}
              <Image src={successIcon} alt="successIcon"></Image>
            </CRow>
          ) : decision == 'Review' ? (
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
                className="btnCustom"
                color="light"
                onClick={handleDecision} // Pass comment if needed
                disabled={decision === 'Rejected' ? isConfirmDisabled : false} // Disable until comment is filled
              >
                {confirm}
              </CButton>
            </CCol>
            <CCol xs={6} className="d-grid mb-3">
              <CButton
                color="danger"
                className="text-white"
                onClick={() => setDeleteModalVisible(false)}
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

export default MDRComponent
