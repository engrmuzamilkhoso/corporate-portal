'use client'
import FeeSlabComponent, { FeeSlabData } from '@/components/FeeSlabComponent'
import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { selectUserAuth, useTypedSelector } from '@/store'
import api from '@/utils/axios'
import { cancel, deactivate, save, update } from '@/utils/crudBtnTexts'
import { templateApplyStatusList } from '@/utils/listExport'
import { cibIfixit, cilBan, cilList, cilTransfer } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
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
} from '@coreui/react-pro'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
// import FeeSlabComponent from './Fee_slab'

import Image from 'next/image'
import successIcon from '@/public/images/ss.gif'
import failedIcon from '@/public/images/ff.gif'
import otherIcon from '@/public/images/alert.gif'
import { isValidHundredRange } from '@/utils/utility'

type FeeType = 'Fixed' | 'Fixed-Slab' | 'Percentile' | 'Percentile-Slab' | '' // Include empty string

const DeactivateFeeTemplateComponent = () => {
  const [templateStatusObject, setTemplateStatusObject] = useState<{
    templateStatus: 'activate' | 'deactivate' | 'delete' | 'hold' | null
    modalVisibility: boolean
    disableSubmit: boolean
  }>({
    templateStatus: null,
    modalVisibility: false,
    disableSubmit: true,
  })

  const [deactivateTemplateObject, setDeactivateTemplateObject] = useState<{
    status: 'deactivateFutureTemplate' | 'deleteTemplate' | null
    modalVisibility: boolean
    disableSubmit: boolean
  }>({
    status: null,
    modalVisibility: false,
    disableSubmit: true,
  })

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
    templateStatus: string
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
    templateStatus: '',
  })

  const [feeSlabs, setFeeSlabs] = useState<FeeSlabData[]>([
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
  const [disabledButton, setDisabledButton] = useState(true)
  const [disableField, setDisableField] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Initialize all tooltips on the page
    const bootstrap = require('bootstrap')
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl)
    })
  }, [])

  const onSlabEdit = () => {
    setDisabledButton(false)
  }

  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as 'deactivateFutureTemplate' | 'deleteTemplate' | ''
    setDeactivateTemplateObject((deactivateTemplateObject) => ({
      ...deactivateTemplateObject,
      status: selectedValue || null,
      disableSubmit: !selectedValue,
    }))
  }

  const handleTemplateApplyStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as 'activate' | 'deactivate' | 'delete' | 'hold' | ''
    setTemplateStatusObject((templateStatusObject) => ({
      ...templateStatusObject,
      templateStatus: selectedValue || null,
      disableSubmit: !selectedValue,
    }))
  }

  const handleDecision = () => {
    const deactivateFutureTemplate = deactivateTemplateObject.status == 'deactivateFutureTemplate'
    const deleteTemplate = deactivateTemplateObject.status == 'deleteTemplate'

    setLoader(true)
    const id = searchParams.get('id')
    api
      .post('/corporate/feesTemplate/deactivateFeeTemplate', {
        feeTemplateId: id,
        deactivateTemplate: true,
        deactivateFutureTemplate,
        deleteTemplate,
      })
      .then((response) => {
        console.log(response)
        if (response.status == 200 && response.data.status == '0000') {
          showToast('success', 'Fee Template Deactivated Successfully')
          fetchData()
          setDisabledButton(true)
        } else if (response.status == 200 && response.data.status != '0000') {
          throw new Error((response.data.message as string).replace(/-/g, ' '))
        }
      })
      .catch((error) => {
        console.error('Error :', error)
        showToast('error', 'Failed to Fee Template deactivate')
      })
      .finally(() => {
        setDeactivateTemplateObject((deactivateTemplateObject) => ({
          ...deactivateTemplateObject,
          modalVisibility: false,
        }))
        setLoader(false)
      })
  }

  const handleStatusDecision = () => {
    setLoader(true)
    const id = searchParams.get('id')
    api
      .post('/corporate/feesTemplate/updateStatus', {
        id,
        template_status: templateStatusObject.templateStatus,
        module: 'fee_template',
      })
      .then((response) => {
        console.log(response)
        if (response.status == 200 && response.data.status == '0000') {
          showToast('success', 'Fee Template Status Updated Successfully')
          fetchData()
        } else if (response.status == 200 && response.data.status != '0000') {
          throw new Error((response.data.message as string).replace(/-/g, ' '))
        }
      })
      .catch((error) => {
        console.error('Error :', error)
        showToast('error', 'Failed to Fee Template deactivate')
      })
      .finally(() => {
        setTemplateStatusObject((templateStatusObject) => ({
          ...templateStatusObject,
          modalVisibility: false,
        }))
        setLoader(false)
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

          const templateStatus = apiData.templateStatus

          setTemplateStatusObject((templateStatusObject) => ({
            ...templateStatusObject,
            templateStatus: templateStatus || null,
          }))

          const deactivateTemplate = apiData.deleteTemplate
            ? 'deleteTemplate'
            : apiData.deactivateFutureTemplate
            ? 'deactivateFutureTemplate'
            : null

          setDeactivateTemplateObject((deactivateTemplateObject) => ({
            ...deactivateTemplateObject,
            status: deactivateTemplate,
          }))

          setFormData(apiData)

          const slabs: any = apiData.slabs
            ? apiData.slabs.map((slab: any, index: number, slabs: any) => ({
                ...slab,
                status: 'saved',
              }))
            : null

          const newSlab: any = {
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
        if (response.status == 200) {
          const pageData = response.data

          const checkerListData = (pageData as any[])
            .filter((checker) => checker.userDetail.userID !== userAuth.id)
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

  const handleChange = (e: any) => {
    setDisabledButton(false)
    const { name, value, type, checked, id } = e.target

    if (id === 'deleteTemplate' || id === 'deactivateFutureTemplate') {
      setFormData({
        ...formData,
        deleteTemplate: !formData.deleteTemplate,
      })
      return
    }

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

  const validateForm = () => {
    // Add your validation logic here
    const { templateName, product, fieldName, displayName, feeType, checkerId, appliedOn, value } =
      formData

    // Example validation: Check if required fields are filled
    return (
      templateName.trim() !== '' &&
      product !== '' &&
      fieldName.trim() !== '' &&
      displayName.trim() !== '' &&
      feeType !== '' &&
      checkerId !== '' &&
      appliedOn !== '' &&
      value != ''
    )
  }

  const handleSubmit = () => {
    const isFormValid = validateForm()

    if (!isFormValid) {
      setValidated(true)
      showToast('error', 'Please fill all required fields')
      return
    }

    if (!isValidHundredRange(formData.orderSeq)) {
      setValidated(true)
      showToast('error', 'Order Sequence can only have a value upto 100')
      return
    }

    setLoader(true)
    const templateData = {
      ...formData,
      // makerCheckerId: '66f54bb42d4ab221bb6be589',
      slabs:
        formData.feeType == 'Fixed-Slab' || formData.feeType == 'Percentile-Slab'
          ? feeSlabs
              .filter((feeSlab) => feeSlab.status !== 'new')
              .map((feeSlab) => ({ ...feeSlab, active: feeSlab.active ? 1 : 0 }))
          : null,
    }

    api
      .post('/corporate/feesTemplate/saveAndUpdate', templateData)
      .then((res: any) => {
        console.log(res)
        const response = res.data
        if (response.status != '0000') {
          showToast('error', (response.message as string).replace(/-/g, ' '))
        } else {
          setDisableField(true)
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

  // @ts-ignore
  // @ts-ignore
  return (
    <CContainer md className="px-4 ">
      <Loader isLoading={loader} />
      <CRow>
        <CCol xl={4}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h2 className="formTitle">Fee Template </h2>
              <p className="formDescription">Deactivate Template</p>
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
                  <Link href="/fee_management/list" passHref>
                    <CButton color="primary" className="btnCustom" size="sm">
                      <CIcon icon={cilList} size="sm" /> Fee Template List
                    </CButton>
                  </Link>
                </CCol>
              </CRow> */}

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
                    {formData?.templateStatus === 'activate' ? (
                      <CBadge className="successStatus px-4 py-2">Active</CBadge>
                    ) : formData?.templateStatus === 'inactive' ? (
                      <CBadge className="otherStatus px-4 py-2">Inactive</CBadge>
                    ) : formData?.templateStatus === 'hold' ? (
                      <CBadge className="pendingStatus px-4 py-2">On Hold</CBadge>
                    ) : formData?.templateStatus === 'delete' ? (
                      <CBadge className="failedStatus px-4 py-2">Deleted</CBadge>
                    ) : (
                      <CBadge className="failedStatus px-4 py-2">{formData.templateStatus}</CBadge>
                    )}
                  </div>
                </CCol>
              </CRow>

              <CForm>
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="templateName">Template Name</CFormLabel>
                    <CFormInput
                      disabled
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
                      disabled
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
                      disabled
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
                      disabled
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
                      disabled={disableField}
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
                      disabled={disableField}
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
                      disabled={disableField}
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
                      disabled={disableField}
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
                      disabled={disableField}
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
                      disabled={disableField}
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
                      disabled={disableField}
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
                      disabled={disableField}
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
                      disabled={disableField}
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
                      // disabled={isDisabled}
                      id="feeType"
                      name="feeType"
                      value={formData.feeType}
                      className={validated && !formData.feeType ? 'is-invalid' : ''}
                      onChange={handleChange}
                      disabled={disableField}
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
                      // disabled={isDisabled}
                      id="checkerId"
                      name="checkerId"
                      className={validated && !formData.checkerId ? 'is-invalid' : ''}
                      value={formData.checkerId}
                      onChange={handleChange}
                      disabled={disableField}
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
                      // disabled={isDisabled}
                      id="appliedOn"
                      name="appliedOn"
                      value={formData.appliedOn}
                      className={validated && !formData.appliedOn ? 'is-invalid' : ''}
                      onChange={handleChange}
                      disabled={disableField}
                    >
                      <option value="">Select Applied On</option>
                      <option value="Merchant">Merchant</option>
                      <option value="Customer">Customer</option>
                    </CFormSelect>
                  </CCol>
                  <CCol>
                    <CFormLabel htmlFor="orderSeq">Order Sequence</CFormLabel>
                    <CFormInput
                      // disabled={isDisabled}
                      type="number"
                      id="orderSeq"
                      name="orderSeq"
                      className={validated && !formData.orderSeq ? 'is-invalid' : ''}
                      value={formData.orderSeq}
                      onChange={handleChange}
                      disabled={disableField}
                    />
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="defaultValue">Default Value</CFormLabel>
                    <CFormInput
                      // disabled={isDisabled}
                      id="defaultValue"
                      name="defaultValue"
                      type="number"
                      value={formData.defaultValue}
                      className={validated && !formData.defaultValue ? 'is-invalid' : ''}
                      onChange={handleChange}
                      disabled={disableField}
                    ></CFormInput>
                  </CCol>
                  <CCol>
                    <CFormLabel htmlFor="value">Value</CFormLabel>
                    <CFormInput
                      // disabled={isDisabled}
                      type="number"
                      id="value"
                      name="value"
                      className={validated && !formData.value ? 'is-invalid' : ''}
                      value={formData.value}
                      onChange={handleChange}
                      disabled={disableField}
                    />
                  </CCol>
                </CRow>
                {formData.feeType == 'Fixed-Slab' || formData.feeType == 'Percentile-Slab' ? (
                  <FeeSlabComponent feeSlabs={feeSlabs} setFeeSlabs={setFeeSlabs} onSlabEdit={onSlabEdit} />
                ) : null}

                {formData.comments && formData.comments.length != 0 && (
                  <CRow className="text-end">
                    <CCol className="d-grid mb-3">
                      <CFormTextarea
                        placeholder="Please add a comment..."
                        value={formData.comments}
                        disabled
                      />
                    </CCol>
                  </CRow>
                )}
                <CRow className="">
                  <CCol className="crud-btns">
                    <CButton
                      size="sm"
                      type="button"
                      color="outline-danger mt-4"
                      disabled={disableField}
                      onClick={() => {
                        setDeactivateTemplateObject((deactivateTemplateObject) => ({
                          ...deactivateTemplateObject,
                          modalVisibility: true,
                        }))
                      }}
                    >
                      <CIcon icon={cilBan} size="sm" /> {deactivate}
                    </CButton>
                    <CButton
                      size="sm"
                      type="button"
                      color="outline-info mt-4"
                      disabled={disableField}
                      onClick={() => {
                        setTemplateStatusObject((templateStatusObject) => ({
                          ...templateStatusObject,
                          modalVisibility: true,
                        }))
                      }}
                    >
                      <CIcon icon={cilTransfer} size="sm" /> Change Application Status
                    </CButton>
                  </CCol>
                  <CCol className="crud-btns text-end">
                    <CButton
                      size="sm"
                      type="button"
                      color="danger text-white mt-4"
                      onClick={() => {
                        router.push('/fee_management/list')
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
        visible={deactivateTemplateObject.modalVisibility}
        alignment="center"
        onClose={() =>
          setDeactivateTemplateObject((deactivateTemplateObject) => ({
            ...deactivateTemplateObject,
            modalVisibility: false,
          }))
        }
      >
        <CModalBody>
          <CRow className="justify-content-center failedIconGif">
            {/* <CIcon icon={cibIfixit} size="5xl" /> */}
            <Image src={failedIcon} alt=""></Image>
          </CRow>

          <CRow className="c-height"></CRow>
          <p className="delete-ask">Deactivate Template for?</p>

          <CRow className="c-height">
            <CCol>
              <CFormSelect
                id="deactivateKey"
                name="deactivateKey"
                value={deactivateTemplateObject.status || ''}
                onChange={handleKeyChange}
              >
                <option value="">Select Reason</option>
                {[
                  {
                    name: 'Deactivate Template for Future Merchants',
                    value: 'deactivateFutureTemplate',
                  },
                  { name: 'Deactivate Template for Current Merchants', value: 'deleteTemplate' },
                ].map((option) => (
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
                color="light btnCustom mt-2 py-2"
                onClick={handleDecision}
                disabled={deactivateTemplateObject.disableSubmit}
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
                  setDeactivateTemplateObject((deactivateTemplateObject) => ({
                    ...deactivateTemplateObject,
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
      <CModal
        visible={templateStatusObject.modalVisibility}
        alignment="center"
        onClose={() =>
          setTemplateStatusObject((templateStatusObject) => ({
            ...templateStatusObject,
            modalVisibility: false,
          }))
        }
      >
        <CModalBody>
          <CRow className="justify-content-center mb-3 pendingIconGif">
            {/* <CIcon icon={cibIfixit} size="5xl" /> */}
            <Image src={otherIcon} alt=""></Image>
          </CRow>

          <CRow className="c-height"></CRow>
          <p className="delete-ask">Change Application Status</p>

          <CRow className="c-height">
            <CCol>
              <CFormSelect
                id="templateStatus"
                name="templateStatus"
                value={templateStatusObject.templateStatus || ''}
                onChange={handleTemplateApplyStatusChange}
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
                color="light btnCustom mt-2 py-2"
                onClick={handleStatusDecision}
                disabled={templateStatusObject.disableSubmit}
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
                  setTemplateStatusObject((templateStatusObject) => ({
                    ...templateStatusObject,
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

export default DeactivateFeeTemplateComponent
