import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import FeeSlabComponent, { FeeSlabData } from '@/components/FeeSlabComponent'
import useToastNotification from '@/hooks/toastNotification'
import api from '@/utils/axios'
import { Close, save } from '@/utils/crudBtnTexts'
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
  CRow,
  CTooltip,
} from '@coreui/react-pro'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
// import FeeSlabComponent, { FeeSlabData } from './Fee_slab'
import Link from 'next/link'
import CIcon from '@coreui/icons-react'
import { cilList } from '@coreui/icons'
import { useTypedSelector, selectUserAuth } from '@/store'
import { TaskStatus } from '@/utils/status.enum'
import { isValidHundredRange } from '@/utils/utility'

type FeeType = 'Fixed' | 'Fixed-Slab' | 'Percentile' | 'Percentile-Slab' | '' // Include empty string

const MakerComponent = () => {
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
    deactivateFutureTemplate: boolean
    applyProduct: boolean
    allowModification: boolean
    feeType: FeeType
    checkerId: string
    makerId: string
    appliedOn: string
    value: string
    defaultValue: string
    orderSeq: string
    comments: string
    makerCheckerStatus: string
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
    deactivateFutureTemplate: false,
    applyProduct: false,
    allowModification: false,
    feeType: '',
    checkerId: '',
    makerId: '',
    appliedOn: '',
    value: '',
    defaultValue: '',
    orderSeq: '1',
    comments: '',
    makerCheckerStatus: '',
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
  const [isDisabled, setIsDisabled] = useState(true)
  const [disabledButton, setDisabledButton] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()
  useEffect(() => {
    // Initialize all tooltips on the page
    const bootstrap = require('bootstrap')
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl)
    })
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const id = searchParams.get('id') || ''
      console.log(id)
      setLoader(true)
      await api
        .post('/corporate/feesTemplate/getFeeTemplateById', { id })
        .then((response: any) => {
          console.log('response: ', response)
          if (response.status == 200 && response.data.status == '0000') {
            const apiData = response.data.data
            setFormData(apiData)
            console.log(apiData)

            const isDisabledCond =
              'makerCheckerStatus' in apiData &&
              apiData.makerCheckerStatus.toLocaleLowerCase() === TaskStatus.Pending
                ? false
                : true

            // setIsDisabled(isDisabledCond)

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

  const onSlabEdit = () => {
    setDisabledButton(false)
  }

  const handleChange = (e: any) => {
    setDisabledButton(false)
    const { name, value, type, checked, id } = e.target
    console.log(name, checked)

    if (id === 'deleteTemplate' || id === 'deactivateFutureTemplate') {
      setFormData({
        ...formData,
        deleteTemplate: !formData.deleteTemplate,
        deactivateFutureTemplate: !formData.deactivateFutureTemplate,
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

  const handleSubmit = () => {
    // Handle form submission logic

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
          setDisabledButton(true)
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

  return (
    <CContainer md className="px-4 ">
      <Loader isLoading={loader} />
      <CRow>
        <CCol xl={4}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h2 className="formTitle">Fee Template Form</h2>
              <p className="formDescription">Update Maker Role Form</p>
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
                      <CIcon icon={cilList} size="sm" /> Template List
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
                      <CBadge className="failedStatus px-4 py-2">{formData.templateStatus ?? "Inactive"}</CBadge>
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
                      required
                      onChange={handleChange}
                    >
                      <option value="">Select Fee Type</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Fixed-Slab">Fixed-Slab</option>
                      <option value="Percentile">Percentile</option>
                      <option value="Percentile-Slab">Percentile-Slab</option>
                    </CFormSelect>
                  </CCol>
                  {formData.checkerId && (
                    <CCol>
                      <CFormLabel htmlFor="checkerId">Checker</CFormLabel>
                      <CFormSelect
                        disabled={isDisabled}
                        id="checkerId"
                        name="checkerId"
                        className={validated && !formData.checkerId ? 'is-invalid' : ''}
                        value={formData.checkerId}
                        required
                        onChange={handleChange}
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
                  )}
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
                      required
                      onChange={handleChange}
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
                      required
                      onChange={handleChange}
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
                      required
                      onChange={handleChange}
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
                      required
                      onChange={handleChange}
                    />
                  </CCol>
                </CRow>
                {formData.feeType == 'Fixed-Slab' || formData.feeType == 'Percentile-Slab' ? (
                  <FeeSlabComponent
                    editable={false}
                    feeSlabs={feeSlabs}
                    setFeeSlabs={setFeeSlabs}
                    onSlabEdit={onSlabEdit}
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
                {!isDisabled && (
                  <CRow className="text-end">
                    <CCol>
                      <CButton type="button" color="primary btnCustom mt-4" onClick={handleSubmit}>
                        {save}
                        <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                        {/* <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 16 16"
                        focusable="false"
                        className="icon-rebrand-no-fill icon-action-arrow-right ms-2"
                      >
                        <path stroke="currentColor" d="M1 8h14m-4-4 4 4-4 4"></path>
                      </svg> */}
                      </CButton>
                    </CCol>
                  </CRow>
                )}
                <CRow className="text-end">
                  <CCol>
                    <Link href="/fee_management/list" passHref>
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

export default MakerComponent
