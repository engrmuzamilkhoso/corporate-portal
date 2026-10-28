import HoverBootstrapIcon from '@/components/HoverBootstrapIcon'
import Loader from '@/components/loader'
import useToastNotification from '@/hooks/toastNotification'
import {
  CCard,
  CCardBody,
  CCol,
  CFormCheck,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CRow,
} from '@coreui/react-pro'
import { useState } from 'react'

interface FeeSlabComponentProps {
  editable?: Boolean
  feeSlabs: FeeSlabData[]
  setFeeSlabs(FeeSlabs: FeeSlabData[]): void
  onSlabEdit?: () => void
}

export interface FeeSlabData {
  minValue: string
  maxValue: string
  fee: string
  active: boolean
  status: 'new' | 'saved' | 'edit'
}

const FeeSlabComponent = ({
  editable = true,
  feeSlabs,
  setFeeSlabs,
  onSlabEdit,
}: FeeSlabComponentProps) => {
  const [validated, setValidated] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [loader, setLoader] = useState(false)
  const { showToast } = useToastNotification()

  const handleValue = (index: number, field: keyof FeeSlabData, value: string | boolean) => {
    const updatedFeeSlabs = [...feeSlabs]
    updatedFeeSlabs[index] = {
      ...updatedFeeSlabs[index],
      [field]: value,
    }
    setFeeSlabs(updatedFeeSlabs)
  }

  const addSlab = () => {
    const newSlab: FeeSlabData = {
      minValue: '',
      maxValue: '',
      fee: '',
      active: false,
      status: 'new',
    }
    setFeeSlabs(feeSlabs.concat(newSlab))
  }

  const removeSlab = (index: number) => {
    if (feeSlabs.length > 1) {
      const updatedSlabs = feeSlabs.slice(0, index).concat(feeSlabs.slice(index + 1))
      setFeeSlabs(updatedSlabs)
    }
  }

  // const validateRanges = (index: number) => {
  //   const { minValue: min, maxValue: max, fee } = feeSlabs[index]
  //   console.log(feeSlabs)

  //   if (!min || !fee) {
  //     showToast('error', 'Please fill the values')
  //     return false
  //   }
  //   const parsedMin = min ? parseFloat(min) : 0
  //   const parsedMax = max ? parseFloat(max) : Infinity

  //   if (parsedMin >= parsedMax) {
  //     showToast('error', 'Min value cannot be greater than or equal to Max value')
  //     return false
  //   }

  //   // Check for overlap with other slabs

  //   for (let i = 0; i < feeSlabs.length; i++) {
  //     if (i !== index) {
  //       const otherMin = parseFloat(feeSlabs[i].minValue)
  //       const otherMax = parseFloat(feeSlabs[i].maxValue)
  //       if (
  //         // (parsedMin >= otherMin && parsedMin < otherMax) ||
  //         // (parsedMax > otherMin && parsedMax <= otherMax)  (parsedMin > otherMin && parsedMin < otherMax) ||  // parsedMin inside another range

  //         (parsedMax > otherMin && parsedMax < otherMax) || // parsedMax inside another range
  //         (parsedMin < otherMin && parsedMax > otherMax) || // New range wraps another range
  //         (parsedMin === otherMin && parsedMax === otherMax) || // Exact match
  //         (parsedMin < otherMax &&
  //           parsedMax > otherMin &&
  //           !(parsedMin === otherMax || parsedMax === otherMin)) // Overlapping ranges (except adjacent)
  //       ) {
  //         showToast('error', 'Ranges cannot overlap with other slabs')
  //         return false
  //       }
  //     }
  //   }
  //   return true
  // }
  const validateRanges = (index: number) => {
    const { minValue: min, maxValue: max, fee } = feeSlabs[index]

    if (!min || !fee) {
      showToast('error', 'Please fill the values')
      return false
    }

    const parsedMin = min ? parseFloat(min) : 0
    const parsedMax = max ? parseFloat(max) : 0 // Default to 0 if max is not provided

    // ** Check if minValue >= maxValue (for valid finite ranges) **
    if (max && parsedMin >= parsedMax) {
      showToast('error', 'Min value cannot be greater than or equal to Max value')
      return false
    }

    // ** Check for overlaps or invalid ranges **
    for (let i = 0; i < feeSlabs.length; i++) {
      if (i !== index) {
        const otherMin = parseFloat(feeSlabs[i].minValue)
        const otherMax = parseFloat(feeSlabs[i].maxValue)

        // ** Case 1: New slab has no maxValue (treated as Infinity) **
        if (!max) {
          // Ensure new minValue is greater than or equal to all existing maxValues
          if (parsedMin < otherMax) {
            showToast(
              'error',
              'Min value must be greater than or equal to the greatest existing Max value',
            )
            return false
          }
        }

        // ** Case 2: Existing slab has maxValue as 0 (treated as Infinity) **
        if (otherMax === 0) {
          // Ensure new slab does not overlap with an infinite range
          if (
            (parsedMin < otherMin && parsedMax > otherMin) || // New range starts before "Inf" range
            (parsedMin >= otherMin && (max || parsedMax === 0)) // New range is entirely within "Inf" range
          ) {
            showToast(
              'error',
              'Infinity range error: cannot overlap with an existing infinite range',
            )
            return false
          }
        }

        // ** Case 3: Regular overlap checks for finite ranges **
        if (
          otherMax &&
          max && // Only check finite ranges here
          ((parsedMax > otherMin && parsedMax < otherMax) || // parsedMax inside another range
            (parsedMin < otherMin && parsedMax > otherMax) || // New range wraps another range
            (parsedMin === otherMin && parsedMax === otherMax) || // Exact match
            (parsedMin < otherMax &&
              parsedMax > otherMin &&
              !(parsedMin === otherMax || parsedMax === otherMin))) // Overlapping ranges (except adjacent)
        ) {
          showToast('error', 'Ranges cannot overlap with other slabs')
          return false
        }
      }
    }

    return true
  }

  const saveSlab = (index: number) => {
    if (validateRanges(index)) {
      const updatedFeeSlabs = [...feeSlabs]
      updatedFeeSlabs[index].status = 'saved'
      updatedFeeSlabs[index].maxValue = updatedFeeSlabs[index].maxValue
        ? updatedFeeSlabs[index].maxValue
        : '0'
      setFeeSlabs(updatedFeeSlabs)
      showToast('success', 'Slab saved successfully')

      // Add a new slab in the "new" stage
      addSlab()
      
      if (onSlabEdit) {
        onSlabEdit()
      }
    }
  }

  const updateSlab = (index: number) => {
    if (validateRanges(index)) {
      const updatedFeeSlabs = [...feeSlabs]
      updatedFeeSlabs[index].status = 'saved'
      setFeeSlabs(updatedFeeSlabs)
      showToast('success', 'Slab saved successfully')
      // Add a new slab in the "new" stage
      addSlab()
    }
  }

  const editSlab = (index: number) => {
    const updatedFeeSlabs = [...feeSlabs]
    updatedFeeSlabs[index].status = 'edit'
    setFeeSlabs(updatedFeeSlabs)

    if (onSlabEdit) {
      onSlabEdit()
    }
  }

  return (
    <CRow>
      <Loader isLoading={loader} />
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardBody>
            <CRow className="mb-2 align-items-center">
              <CCol xs={3}>
                <CFormLabel htmlFor="min">Minimum Value</CFormLabel>
              </CCol>
              <CCol xs={3}>
                <CFormLabel htmlFor="max">Maximum Value</CFormLabel>
              </CCol>
              <CCol xs={3}>
                <CFormLabel htmlFor="fee">Fee</CFormLabel>
              </CCol>
              <CCol xs={1}>
                <CFormLabel htmlFor="status">Status</CFormLabel>
              </CCol>
              {editable && (
                <CCol xs={2} style={{ textAlign: 'center' }}>
                  <CFormLabel htmlFor="actions">Action</CFormLabel>
                </CCol>
              )}
            </CRow>
            {feeSlabs.map((slab, index) => (
              <CRow key={index} className="mb-2 align-items-center">
                <CCol xs={3}>
                  <CInputGroup>
                    <CFormInput
                      id={`min-${index}`}
                      type="number"
                      placeholder="0"
                      value={slab.minValue}
                      disabled={slab.status === 'saved'}
                      onChange={(e) => handleValue(index, 'minValue', e.target.value)}
                      required
                      invalid={validated && !slab.minValue}
                    />
                    <CFormFeedback invalid>Please enter a minimum value.</CFormFeedback>
                  </CInputGroup>
                </CCol>
                <CCol xs={3}>
                  <CInputGroup>
                    <CFormInput
                      id={`max-${index}`}
                      type="number"
                      placeholder="10"
                      value={slab.maxValue}
                      disabled={slab.status === 'saved'}
                      onChange={(e) => handleValue(index, 'maxValue', e.target.value)}
                      required
                      invalid={validated && !slab.maxValue}
                    />
                    <CFormFeedback invalid>Please enter a maximum value.</CFormFeedback>
                  </CInputGroup>
                </CCol>
                <CCol xs={3}>
                  <CInputGroup>
                    <CFormInput
                      id={`fee-${index}`}
                      type="number"
                      placeholder="10"
                      value={slab.fee}
                      disabled={slab.status === 'saved'}
                      onChange={(e) => handleValue(index, 'fee', e.target.value)}
                      required
                      invalid={validated && !slab.fee}
                    />
                    <CFormFeedback invalid>Please enter a fee value.</CFormFeedback>
                  </CInputGroup>
                </CCol>
                <CCol xs={1} className="d-flex align-items-center justify-content-center">
                  <CFormCheck
                    id="active"
                    name="active"
                    disabled={slab.status === 'saved'}
                    checked={slab.active}
                    required
                    onChange={(e) => handleValue(index, 'active', e.target.checked)}
                  />
                </CCol>

                {editable && (
                  <CCol xs={2} className="d-flex align-items-center justify-content-evenly">
                    {slab.status === 'new' && (
                      <HoverBootstrapIcon
                        defaultIcon="bi-floppy-fill"
                        hoverIcon="bi-floppy"
                        style={{ color: 'green' }}
                        onClick={() => saveSlab(index)}
                      />
                    )}
                    {slab.status === 'saved' && (
                      <HoverBootstrapIcon
                        defaultIcon="bi-pencil-fill"
                        hoverIcon="bi-pencil"
                        style={{ color: 'gray' }}
                        onClick={() => editSlab(index)}
                      />
                    )}
                    {slab.status === 'edit' && (
                      <>
                        <HoverBootstrapIcon
                          defaultIcon="bi-floppy-fill"
                          hoverIcon="bi-floppy"
                          style={{ color: 'green' }}
                          onClick={() => updateSlab(index)}
                        />

                        <HoverBootstrapIcon
                          defaultIcon="bi-trash3-fill"
                          hoverIcon="bi-trash3"
                          style={{ color: 'red' }}
                          onClick={() => removeSlab(index)}
                        />
                      </>
                    )}
                  </CCol>
                )}
              </CRow>
            ))}
          </CCardBody>
        </CCard>
      </CCol>
      {/* <ToastNotification /> */}
    </CRow>
  )
}

export default FeeSlabComponent
