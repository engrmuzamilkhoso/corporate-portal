'use client'

import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import Buttons from './buttons'
import { api } from '@/utils/axios'
import { cilBan, cilList, cilPencil } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormFeedback,
  CFormLabel,
  CFormSelect,
  CRow,
  CFormInput,
  CContainer,
  CBadge,
} from '@coreui/react-pro'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { update } from '@/utils/crudBtnTexts'
import Link from 'next/link'

const roleList = [
  { label: 'Maker', value: 'Maker' },
  { label: 'Checker', value: 'Checker' },
]

const RoleAssign = () => {
  const { showToast } = useToastNotification()
  const [group, setGroup] = useState({
    id: '',
    userId: '',
    pageCode: '',
    role: '',
    status: true,
    isValid: false,
  })
  const [userOptions, setUserOptions] = useState<any[]>([])
  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Extract values from query params
  useEffect(() => {
    const id = searchParams.get('id') || ''
    const userId = searchParams.get('userId') || ''
    const pageCode = searchParams.get('pageCode') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') === 'false' ? false : true

    setGroup({
      id,
      userId,
      pageCode,
      role,
      status,
      isValid: validateGroup({ userId, pageCode, role }),
    })
  }, [searchParams])

  const setUsers = (userList: any) => {
    setUserOptions(
      userList.map((user: any) => ({
        label: user.firstName + ' ' + user.lastName,
        value: user.id,
      })),
    )
  }

  const fetchUserOptions = async () => {
    setLoader(true)
    try {
      const usersResponse = await api.post('/user/v2/all', { limit: 40, isCorporate: true })
      if (usersResponse.status === 200) {
        const filteredUsers = usersResponse.data.content.filter(
          (user: any) =>
            user.roles &&
            user.roles.some((role: any) => role && role.privileges && role.privileges.length > 0),
        )
        setUsers(filteredUsers)
      }
    } catch (error) {
      console.log(error)

      showToast('error', 'Failed to load users')
    } finally {
      setLoader(false)
    }
  }

  useEffect(() => {
    fetchUserOptions()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle input change
  const handleGroupChange = (field: string, value: any) => {
    const updatedGroup = { ...group, [field]: value }
    updatedGroup.isValid = validateGroup(updatedGroup)
    setGroup(updatedGroup)
  }

  // Validate group before submission
  const validateGroup = (group: any) => {
    return group.userId !== '' && group.pageCode !== '' && group.role !== ''
  }

  // Save form data
  const saveAssignment = async () => {
    if (!group.isValid) {
      setValidated(true)
      showToast('error', 'Please fill all required fields')
      return
    }
    setLoader(true)
    try {
      const response = await api.post('/corporate/makerCheckerRole/update', { ...group })
      if (response.status == 200) {
        const data = response.data
        if (data.status !== '0000') {
          showToast('error', (data.message as string).replace(/-/g, ' '))
        } else {
          showToast('success', 'Role assigned successfully!')
          setTimeout(() => {
            router.push('/maker_checker/list')
          }, 1000)
        }
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      showToast('error', 'Error assigning role')
    } finally {
      setLoader(false)
    }
  }

  return (
    <CContainer md className="px-4">
      <CRow>
        <Loader isLoading={loader} />

        <CCol xl={4}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h2 className="formTitle">Update Assignment</h2>
              <p className="formDescription">Assignment Details</p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={8}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <CRow className="mt-2">
                <CCol xs={4}></CCol>
                <CCol xs={4}></CCol>
                <CCol className="text-end" xs={4}>
                  {/* <Link href="/maker_checker/list" passHref>
                    <CButton color="primary" variant="outline" size="sm">
                      <CIcon icon={cilList} size="sm" /> User List
                    </CButton>
                  </Link> */}
                  <Buttons itemsData={group} />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol lg={12} className='d-flex'>
                  <CFormLabel htmlFor="Template Status" className='my-auto me-2'>Template Status</CFormLabel>
                  <div>
                    {group.status ? (
                      <CBadge color="success successStatus px-4 py-2">Activate</CBadge>
                    ) : (
                      <CBadge color="danger failedStatus px-4 py-2">Deactivate</CBadge>
                    )}
                  </div>

                </CCol>

              </CRow>
              <CForm noValidate className={validated ? 'was-validated' : ''}>
                <CRow>
                  <CCol lg={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="user">User</CFormLabel>
                      <CFormSelect
                        id="user"
                        value={group.userId}
                        onChange={(e) => handleGroupChange('userId', e.target.value)}
                        required
                        disabled
                        className={validated && !group.userId ? 'is-invalid' : ''}
                      >
                        <option value="">Select User</option>
                        {userOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </CFormSelect>
                      <CFormFeedback invalid>Please select a user.</CFormFeedback>
                    </div>
                  </CCol>

                  <CCol lg={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="pageCode">Page Code</CFormLabel>
                      <CFormInput id="pageCode" value={group.pageCode} disabled required />
                    </div>
                  </CCol>

                  <CCol lg={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="status">Status</CFormLabel>
                      <CFormSelect
                        id="status"
                        value={group.status ? 'true' : 'false'}
                        onChange={(e) => handleGroupChange('status', e.target.value === 'true')}
                        required
                        disabled
                      >
                        <option value="true">Activate</option>
                        <option value="false">Deactivate</option>
                      </CFormSelect>
                    </div>
                  </CCol>

                  <CCol lg={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="role">Role</CFormLabel>
                      <CFormSelect
                        id="role"
                        value={group.role}
                        onChange={(e) => handleGroupChange('role', e.target.value)}
                        required
                      >
                        {roleList.map((role) => (
                          <option value={role.value} key={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </CFormSelect>
                    </div>
                  </CCol>
                </CRow>

                <CRow className="text-end mt-2">
                  <CCol className="crud-btns" xs={12}>
                    {/* <Buttons itemsData={group} /> */}
                    <Link href="/maker_checker/list" passHref>
                      <CButton color="danger" className='text-white'>
                        Cancel
                      </CButton>
                    </Link>
                    <CButton
                      color="primary btnCustom"
                      onClick={saveAssignment}
                    >
                      {' '}
                      {update}
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

export default RoleAssign
