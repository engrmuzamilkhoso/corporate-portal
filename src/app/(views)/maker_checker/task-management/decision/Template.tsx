'use client'
import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import api from '@/utils/axios'
import { approve, cancel, confirm, reject, inreview, save, Close } from '@/utils/crudBtnTexts'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import FeeSlabComponent, { FeeSlabData } from '@/components/FeeSlabComponent'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
// import FeeSlabComponent from './Fee_slab'
import Link from 'next/link'
import CIcon from '@coreui/icons-react'
import {
  cibIfixit,
  cilCheckAlt,
  cilCheckCircle,
  cilCommentBubble,
  cilDelete,
  cilList,
} from '@coreui/icons'
import { useTypedSelector, selectUserAuth } from '@/store'
import axios from 'axios'
import Image from 'next/image'
import successIcon from '@/public/images/ss.gif'
import failedIcon from '@/public/images/ff.gif'
import otherIcon from '@/public/images/alert.gif'
import { TaskStatus } from '@/utils/status.enum'

type FeeType = 'Fixed' | 'Fixed-Slab' | 'Percentile' | 'Percentile-Slab' | '' // Include empty string

const FeeTemplateComponent = ({ isDecisionDisabled }: { isDecisionDisabled: boolean }) => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [decision, setDecision] = useState<'approved' | 'rejected' | 'review' | ''>('')
  const [formData, setFormData] = useState<{
    templateName: string
    product: string
    fieldName: string
    displayName: string
    mandatory: boolean
    reversal: boolean
    refund: boolean
    revert: boolean
    status: boolean
    apply: boolean
    applyTemplate: boolean
    deactivateTemplate: boolean
    deleteTemplate: boolean
    applyProduct: boolean
    allowModification: boolean
    feeType: FeeType
    checkerId: string
    appliedOn: string
    value: string
    defaultValue: string
    orderSeq: string
    makerCheckerStatus: string
    comments: string
  }>({
    templateName: '',
    product: '',
    fieldName: '',
    displayName: '',
    mandatory: false,
    reversal: false,
    refund: false,
    revert: false,
    status: false,
    apply: false,
    applyTemplate: false,
    deactivateTemplate: false,
    deleteTemplate: false,
    applyProduct: false,
    allowModification: false,
    feeType: '',
    checkerId: '',
    appliedOn: '',
    value: '',
    defaultValue: '',
    orderSeq: '1',
    makerCheckerStatus: '',
    comments: '',
  })

  const [feeSlabs, setFeeSlabs] = useState<any>([
    {
      minValue: '',
      maxValue: '',
      fee: '',
      active: false,
      status: 'new',
    },
  ])

  const [checkerList, setCheckerList] = useState<{ label: string; value: string }[]>([])

  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [isDisabled, setIsDisabled] = useState(true)
  const [comment, setComment] = useState('')
  const [isConfirmDisabled, setIsConfirmDisabled] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Initialize all tooltips on the page
    const bootstrap = require('bootstrap')
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl)
    })
  }, [])

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
    setIsConfirmDisabled(e.target.value.trim() === '') // Disable if comment is empty or whitespace
  }

  const handleDecision = () => {
    console.log('here')

    setDeleteModalVisible(false)
    setLoader(true)
    const id = searchParams.get('id')
    api
      .post('/corporate/feesTemplate/decisionByChecker', {
        feeTemplateId: id,
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
        fetchData()
        setLoader(false)
        showToast('success', 'Task has been ' + decision + ' successfully')
      })
  }
  const fetchData = async () => {
    const id = searchParams.get('id') || ''
    setLoader(true)
    await api
      .post('/corporate/feesTemplate/getFeeTemplateById', { id })
      .then((response: any) => {
        console.log('response: ', response)
        if (response.status == 200 && response.data.status == '0000') {
          const apiData = response.data.data
          setFormData(apiData)
          const slabs: any = apiData.slabs
            ? apiData.slabs.map((slab: any, index: number, slabs: any) => ({
                ...slab,
                status: 'saved',
              }))
            : null

          setFeeSlabs(slabs)
          // const newSlab: any = {
          //   minValue: '',
          //   maxValue: '',
          //   fee: '',
          //   active: false,
          //   status: 'saved',
          // }
          // setFeeSlabs(slabs ? slabs.concat(newSlab) : [newSlab])
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
      .post('corporate/makerCheckerRole/checkerByScreen?pageCode=TEMPLATECREATE')
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

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    console.log(name, checked)

    if (name == 'deactivateTemplate' || name == 'applyTemplate') {
      if (
        (formData.applyTemplate && name == 'deactivateTemplate' && value) ||
        (formData.deactivateTemplate && name == 'applyTemplate' && value)
      ) {
        showToast(
          'error',
          'Apply Template and Deactivate Template cant be selected on the same template.',
        )
        return
      }
    }

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

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
              {/* <CRow className="p-2">
                <CCol xs={4}></CCol>
                <CCol xs={4}></CCol>
                <CCol className="text-end" xs={4}>
                  <Link href="/maker_checker/task-management" passHref>
                    <CButton color="primary" className="btnCustom" size="sm">
                      <CIcon icon={cilList} size="sm" /> Task List
                    </CButton>
                  </Link>
                </CCol>
              </CRow> */}
              <CRow className="mb-3">
                <CCol lg={12} className="d-flex">
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
              </CRow>

              <CForm>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="templateName">Template Name</CFormLabel>
                    <CFormInput
                      disabled={isDisabled}
                      type="text"
                      id="templateName"
                      name="templateName"
                      value={formData.templateName}
                      required
                      className={validated && !formData.templateName ? 'is-invalid' : ''}
                      onChange={handleChange}
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="product">Product</CFormLabel>
                    <CFormSelect
                      disabled={isDisabled}
                      id="product"
                      name="product"
                      value={formData.product}
                      required
                      className={validated && !formData.product ? 'is-invalid' : ''}
                      onChange={handleChange}
                    >
                      <option value="">Select Product</option>
                      <option value="Collection">Collection</option>
                      <option value="Disbursement">Disbursement</option>
                      <option value="Remittance">Remittance</option>
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="fieldName">Field Name</CFormLabel>
                    <CFormInput
                      disabled={isDisabled}
                      type="text"
                      id="fieldName"
                      name="fieldName"
                      value={formData.fieldName}
                      className={validated && !formData.fieldName ? 'is-invalid' : ''}
                      required
                      onChange={handleChange}
                    />
                  </CCol>
                  <CCol>
                    <CFormLabel htmlFor="displayName">Display Name</CFormLabel>
                    <CFormInput
                      disabled={isDisabled}
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      className={validated && !formData.displayName ? 'is-invalid' : ''}
                      required
                      onChange={handleChange}
                    />
                  </CCol>
                </CRow>

                <CRow>
                  <CCol className="d-flex align-items-center">
                    <CFormCheck
                      id="mandatory"
                      name="mandatory"
                      label="Mandatory"
                      checked={formData.mandatory}
                      required
                      onChange={handleChange}
                      className="me-2"
                      disabled
                    />
                    <i
                      className="bi bi-exclamation-circle"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Fees will be deducted in every case even in rejected case."
                    ></i>
                  </CCol>

                  <CCol className="d-flex align-items-center">
                    <CFormCheck
                      id="reversal"
                      name="reversal"
                      label={
                        <>
                          Reversal{' '}
                          <small style={{ marginTop: 2, fontSize: '0.87rem' }}>(Payout)</small>
                        </>
                      }
                      checked={formData.reversal}
                      required
                      onChange={handleChange}
                      className="me-2"
                      disabled
                    />
                    <i
                      className="bi bi-exclamation-circle my-1"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Fees will be applied only when disbursement is reversed."
                    ></i>
                  </CCol>

                  <CCol className="d-flex align-items-center">
                    <CFormCheck
                      id="status"
                      name="status"
                      label="Status"
                      checked={formData.status}
                      required
                      onChange={handleChange}
                      className="me-2"
                      disabled
                    />
                    <i
                      className="bi bi-exclamation-circle my-1"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Currently active or not."
                    ></i>
                  </CCol>

                  <CCol className="d-flex align-items-center">
                    <CFormCheck
                      id="apply"
                      name="apply"
                      label="Apply"
                      checked={formData.apply}
                      required
                      onChange={handleChange}
                      className="me-2"
                      disabled
                    />
                    <i
                      className="bi bi-exclamation-circle my-1"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Should be displayed to merchants."
                    ></i>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol xs={3} className="d-flex align-items-center">
                    <CFormCheck
                      id="refund"
                      name="refund"
                      label={
                        <>
                          Refund <small style={{ marginTop: 2 }}>(Payin)</small>
                        </>
                      }
                      checked={formData.refund}
                      required
                      onChange={handleChange}
                      className="me-2"
                      disabled
                    />
                    <i
                      className="bi bi-exclamation-circle my-1"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Fees will be applied only when disbursement is reversed."
                    ></i>
                  </CCol>
                  <CCol xs={3} className="d-flex align-items-center">
                    <CFormCheck
                      id="revert"
                      name="revert"
                      label="Revert"
                      checked={formData.revert}
                      required
                      onChange={handleChange}
                      className="me-2"
                      disabled
                    />
                    <i
                      className="bi bi-exclamation-circle my-1"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Fees will be reverted when disbursement is reversed."
                    ></i>
                  </CCol>
                  <CCol xs={3} className="d-flex align-items-center">
                    <CFormCheck
                      id="applyTemplate"
                      name="applyTemplate"
                      label="Apply Template"
                      checked={formData.applyTemplate}
                      required
                      onChange={handleChange}
                      className="me-2"
                      disabled
                    />
                    <i
                      className="bi bi-exclamation-circle my-1"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Fees will be applied only when disbursement is reversed."
                    ></i>
                  </CCol>

                  <CCol xs={3} className="d-flex align-items-center">
                    <CFormCheck
                      id="applyProduct"
                      name="applyProduct"
                      label="Apply Product"
                      checked={formData.applyProduct}
                      required
                      onChange={handleChange}
                      className="me-2"
                      disabled
                    />
                    <i
                      className="bi bi-exclamation-circle my-1"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Fees will be applied only when disbursement is reversed."
                    ></i>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol xs={4} className="d-flex align-items-center">
                    <CFormCheck
                      id="allowModification"
                      name="allowModification"
                      label="Allow Modification"
                      checked={formData.allowModification}
                      required
                      onChange={handleChange}
                      className="me-2"
                      disabled
                    />
                    <i
                      className="bi bi-exclamation-circle my-1"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Fees will be applied only when disbursement is reversed."
                    ></i>
                  </CCol>
                  <CCol xs={3}>
                    {/* <CFormCheck
                      id="deactivateTemplate"
                      name="deactivateTemplate"
                      label="Deactivate Template"
                      checked={formData.deactivateTemplate}
                      required
                      onChange={handleChange}
                    />
                    <i
                      className="bi bi-exclamation-circle my-1"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Deactivate the template for current merchants."
                    ></i> */}
                  </CCol>
                  {formData.deactivateTemplate && (
                    <CCol xs={6}>
                      {/* <CFormCheck
                        inline
                        type="radio"
                        name="deleteTemplate"
                        id="deleteTemplate"
                        label="Delete Template for current Merchants"
                        onChange={handleChange}
                        checked={formData.deleteTemplate}
                      />
                      <i
                        className="bi bi-exclamation-circle my-1"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Delete template for current merchants only."
                      ></i>

                      <CFormCheck
                        inline
                        type="radio"
                        name="deactivateFutureTemplate"
                        id="deactivateFutureTemplate"
                        label="Delete Template for Future Merchants"
                        onChange={handleChange}
                        checked={formData.deactivateFutureTemplate}
                      />
                      <i
                        className="bi bi-exclamation-circle my-1"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Delete template for future merchants."
                      ></i> */}
                    </CCol>
                  )}
                </CRow>

                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="feeType">Fee Type</CFormLabel>
                    <CFormSelect
                      disabled={isDisabled}
                      id="feeType"
                      name="feeType"
                      value={formData.feeType}
                      className={validated && !formData.feeType ? 'is-invalid' : ''}
                      onChange={handleChange}
                    >
                      <option value="">Select Fee Type</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Fixed-Slab">Fixed-Slab</option>
                      <option value="Percentile">Percentile</option>
                      <option value="Percentile-Slab">Percentile-Slab</option>
                    </CFormSelect>
                  </CCol>
                  <CCol>
                    <CFormLabel htmlFor="checkerId">Checker</CFormLabel>
                    <CFormSelect
                      disabled={isDisabled}
                      id="checkerId"
                      name="checkerId"
                      className={validated && !formData.checkerId ? 'is-invalid' : ''}
                      value={formData.checkerId}
                    >
                      <option value="">Select Checker</option>
                      {checkerList.map((checkerId) => (
                        <option key={checkerId.value} value={checkerId.value}>
                          {checkerId.label}
                        </option>
                      ))}
                      {/* Options for Checkers can be populated dynamically */}
                    </CFormSelect>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="appliedOn">Applied on</CFormLabel>
                    <CFormSelect
                      disabled={isDisabled}
                      id="appliedOn"
                      name="appliedOn"
                      value={formData.appliedOn}
                      className={validated && !formData.appliedOn ? 'is-invalid' : ''}
                    >
                      <option value="">Select Applied On</option>
                      <option value="Merchant">Merchant</option>
                      <option value="Customer">Customer</option>
                    </CFormSelect>
                  </CCol>
                  <CCol>
                    <CFormLabel htmlFor="orderSeq">Order Sequence</CFormLabel>
                    <CFormInput
                      disabled={isDisabled}
                      type="number"
                      id="orderSeq"
                      name="orderSeq"
                      className={validated && !formData.orderSeq ? 'is-invalid' : ''}
                      value={formData.orderSeq}
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="defaultValue">Default Value</CFormLabel>
                    <CFormInput
                      disabled={isDisabled}
                      id="defaultValue"
                      name="defaultValue"
                      type="number"
                      value={formData.defaultValue}
                      className={validated && !formData.defaultValue ? 'is-invalid' : ''}
                    ></CFormInput>
                  </CCol>
                  <CCol>
                    <CFormLabel htmlFor="value">Value</CFormLabel>
                    <CFormInput
                      disabled={isDisabled}
                      type="number"
                      id="value"
                      name="value"
                      className={validated && !formData.value ? 'is-invalid' : ''}
                      value={formData.value}
                    />
                  </CCol>
                </CRow>
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
                {!isDecisionDisabled && (
                  <CRow className="text-end">
                    {formData.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Pending ? (
                      <CCol className="crud-btns">
                        <CButton
                          size="sm"
                          type="button"
                          color="success mt-4"
                          onClick={() => handleSubmit('approved')}
                        >
                          {approve} <CIcon icon={cilCheckAlt} />
                        </CButton>
                        <CButton
                          size="sm"
                          type="button"
                          color="danger text-light mt-4"
                          onClick={() => handleSubmit('rejected')}
                        >
                          {reject} <i className="bi bi-x-lg"></i>
                        </CButton>
                        <CButton
                          size="sm"
                          type="button"
                          color="info text-light mt-4"
                          onClick={() => handleSubmit('review')}
                        >
                          {inreview} <CIcon icon={cilCommentBubble} />
                        </CButton>

                        <Link href="/maker_checker/task-management" passHref>
                          <CButton color="secondary" className="me-2 btn-sm mt-4">
                            {Close}
                          </CButton>
                        </Link>
                      </CCol>
                    ) : formData.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Approved ? (
                      <CCol className="crud-btns">
                        {/* <CButton type="button" color="success text-light">
                          Status : Approved <i className="bi bi-check2-circle"></i>
                        </CButton> */}
                        <Link href="/maker_checker/task-management" passHref>
                          <CButton color="danger" className="text-white me-2">
                            {Close}
                          </CButton>
                        </Link>
                      </CCol>
                    ) : formData.makerCheckerStatus.toLocaleLowerCase() == TaskStatus.Review ? (
                      // <CRow>
                      <>
                        {/* <CButton type="button" color="warning" className="text-light">
                            Status : In Review <CIcon icon={cilCommentBubble} />
                          </CButton> */}

                        <CCol className="crud-btns mt-2">
                          <CButton
                            size="sm"
                            type="button"
                            color="success"
                            onClick={() => handleSubmit('approved')}
                          >
                            {approve} <CIcon icon={cilCheckAlt} />
                          </CButton>
                          <CButton
                            size="sm"
                            type="button"
                            color="danger text-light"
                            onClick={() => handleSubmit('rejected')}
                          >
                            {reject} <i className="bi bi-x-lg"></i>
                          </CButton>

                          <Link href="/maker_checker/task-management" passHref>
                            <CButton color="secondary" className="text-white me-2 btn-sm">
                              {Close}
                            </CButton>
                          </Link>
                        </CCol>
                      </>
                    ) : (
                      // </CRow>
                      <CCol className="crud-btns">
                        {/* <CButton className="text-light" type="button" color="danger">
                          Status : {formData.makerCheckerStatus} <i className="bi bi-x-lg"></i>
                        </CButton> */}
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
      ;
      <ToastNotification />
    </CContainer>
  )
}

export default FeeTemplateComponent
