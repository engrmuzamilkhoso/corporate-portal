'use client'

import { useState } from 'react'
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
  CFormCheck,
  CFormTextarea,
  CRow,
} from '@coreui/react-pro'
import { save } from '@/utils/crudBtnTexts'

const regions = [
  { value: '', label: '' },
  { value: 'pk', label: 'Pakistan' },
  { value: 'bg', label: 'Bangladesh' },
]

const operators = [
  { value: '', label: '' },
  { value: 'trust-bank', label: 'Trust Bank' },
  { value: 'city-bank', label: 'City Bank' },
  { value: 'dbbl', label: 'DBBL' },
]

const storeIds = [
  { value: '', label: '' },
  { value: 'store-1', label: 'Store 1' },
  { value: 'store-2', label: 'Store 2' },
  { value: 'store-3', label: 'Store 3' },
]

const FileUpload = () => {
  const [validated, setValidated] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const [uploadData, setUploadData] = useState({
    region: '',
    operator: '',
    storeId: '',
    uploadType: 'Manual',
    comment: '',
    date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  })

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setUploadData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleDrag = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(
        (file: any) => file.type === 'text/csv' || file.name.endsWith('.csv'),
      )
      setUploadedFiles(files as File[])
    }
  }

  const handleFileChange = (e: any) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files).filter(
        (file: any) => file.type === 'text/csv' || file.name.endsWith('.csv'),
      )
      setUploadedFiles(files as File[])
    }
  }

  const validateForm = () => {
    const { region, operator, storeId, date } = uploadData
    return region && operator && storeId && date && uploadedFiles.length > 0
  }

  const handleSave = () => {
    setValidated(false)
    const isFormValid = validateForm()

    if (!isFormValid) {
      setValidated(true)
      return
    }

    console.log('Upload Data:', uploadData)
    console.log('Files:', uploadedFiles)

    setDisabled(true)

    // Simulate upload
    setTimeout(() => {
      console.log('Files uploaded successfully!')
      setDisabled(false)
    }, 2000)
  }


  const handleUploadAnother = () => {
    setUploadedFiles([])
    setUploadData({
      region: '',
      operator: '',
      storeId: '',
      uploadType: 'Manual',
      comment: '',
      date: new Date().toISOString().split('T')[0],
    })
    setValidated(false)
  }

  return (
    <CContainer className="px-4">
      <CRow>
        <CCol xl={3}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h3 className="mb-4">File Upload</h3>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={4}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <CForm>
                {/* Region Field */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="region">Region</CFormLabel>
                    <CFormSelect
                      name="region"
                      value={uploadData.region}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !uploadData.region ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      {regions.map((region) => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                {/* Operator Field */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="operator">Operator</CFormLabel>
                    <CFormSelect
                      name="operator"
                      value={uploadData.operator}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !uploadData.operator ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      {operators.map((operator) => (
                        <option key={operator.value} value={operator.value}>
                          {operator.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                {/* Store ID Field */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="storeId">Store ID</CFormLabel>
                    <CFormSelect
                      name="storeId"
                      value={uploadData.storeId}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !uploadData.storeId ? 'is-invalid mt-2' : 'mt-2'}
                    >
                      {storeIds.map((store) => (
                        <option key={store.value} value={store.value}>
                          {store.label}
                        </option>
                      ))}
                    </CFormSelect>
                  </CCol>
                </CRow>

                {/* Upload Type Radio Buttons */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel>Upload Type:</CFormLabel>
                    <div className="mt-2">
                      <CFormCheck
                        type="radio"
                        name="uploadType"
                        id="manual"
                        value="Manual"
                        label="Manual"
                        checked={uploadData.uploadType === 'Manual'}
                        onChange={handleChange}
                        disabled={disabled}
                        className="me-3"
                        inline
                      />
                      <CFormCheck
                        type="radio"
                        name="uploadType"
                        id="correction"
                        value="Correction"
                        label="Correction"
                        checked={uploadData.uploadType === 'Correction'}
                        onChange={handleChange}
                        disabled={disabled}
                        className="me-3"
                        inline
                      />
                      <CFormCheck
                        type="radio"
                        name="uploadType"
                        id="missing-file"
                        value="Missing File"
                        label="Missing File"
                        checked={uploadData.uploadType === 'Missing File'}
                        onChange={handleChange}
                        disabled={disabled}
                        inline
                      />
                    </div>
                  </CCol>
                </CRow>

                {/* Comment Field */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="comment">Comment:</CFormLabel>
                    <CFormTextarea
                      name="comment"
                      value={uploadData.comment}
                      onChange={handleChange}
                      disabled={disabled}
                      className="mt-2"
                      rows={3}
                    />
                  </CCol>
                </CRow>

                {/* Date Field */}
                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="date">Date :</CFormLabel>
                    <CFormInput
                      type="date"
                      name="date"
                      value={uploadData.date}
                      onChange={handleChange}
                      required
                      disabled={disabled}
                      className={validated && !uploadData.date ? 'is-invalid mt-2' : 'mt-2'}
                    />
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* File Upload Section */}
        <CCol xl={5}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <div className="text-center mb-3">
                <h5>Upload File</h5>
              </div>

              <div
                className={`upload-zone ${dragActive ? 'drag-active' : ''} ${
                  validated && uploadedFiles.length === 0 ? 'is-invalid' : ''
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                style={{
                  border: '2px dashed #ccc',
                  borderRadius: '8px',
                  padding: '60px 20px',
                  textAlign: 'center',
                  backgroundColor: dragActive ? '#f8f9fa' : 'transparent',
                  cursor: 'pointer',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontSize: '48px', color: '#6c757d', marginBottom: '20px' }}>↑</div>
                <h5 style={{ color: '#6c757d', marginBottom: '10px' }}>Drop files here</h5>
                <p style={{ color: '#6c757d', marginBottom: '20px' }}>Supported format: CSV</p>
                <p
                  style={{
                    color: '#6c757d',
                    marginBottom: '20px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  OR
                </p>
                <input
                  type="file"
                  id="file-input"
                  multiple
                  accept=".csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={disabled}
                />
                <CButton
                  color="primary"
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                  disabled={disabled}
                >
                  Browse files
                </CButton>
              </div>

              {/* Display uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3">
                  <h6>Uploaded Files:</h6>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="alert alert-info">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 d-flex justify-content-between">
                <CButton
                  color="primary"
                  variant="outline"
                  onClick={handleUploadAnother}
                  disabled={disabled}
                >
                  Upload Another File
                </CButton>
                <div>
                  <CButton
                    type="button"
                    color="primary btnCustom "
                    onClick={handleSave}
                    disabled={disabled}
                  >
                    {save}
                    <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                  </CButton>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default FileUpload
