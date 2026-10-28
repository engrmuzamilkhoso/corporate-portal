'use client'

import { api } from '@/utils/axios'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CMultiSelect,
  CRow,
} from '@coreui/react-pro'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import useToastNotification from '../../../../hooks/toastNotification'
import { cancel, Close, update } from '../../../../utils/crudBtnTexts'
import Loader from './../../../../components/loader'
import ButtonComponent from './buttons'
import ToastNotification from '@/components/ToastNotification'
import Link from 'next/link'
import CIcon from '@coreui/icons-react'
import { cilList } from '@coreui/icons'

const EditUser = () => {
  const searchParams = useSearchParams()
  const email_query = decodeURIComponent(searchParams.get('email') as string)
  const { showToast } = useToastNotification()
  const [loader, setLoader] = useState(true)
  const [validated, setValidated] = useState(false)
  const [roles, setRoles] = useState([])
  const [userCheck, setUserCheck] = useState('1')
  const [selectedRole, setSelectedRole] = useState('')
  const [updatedUser, setUpdatedUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
    password: '',
    enabled: false,
  })
  const [disabled, setDisabled] = useState(false)

  const router = useRouter()

  // Fetch user and roles data on mount
  useEffect(() => {
    const fetchUserAndRoles = async () => {
      try {
        const userResponse = await api.post('user/get', { email: email_query, isCorporate: true })
        const userData = userResponse.data

        if (Object.keys(userData).length === 0) {
          setUserCheck('0')
        } else {
          setUpdatedUser({
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            roleId: userData.roleId,
            password: userData.password,
            enabled: userData.enabled,
          })
          setDisabled(!userData.enabled)
        }

        const rolesResponse = await api.post('user/roles', { isCorporate: true })
        const transformedRoles = rolesResponse.data.map((role: { id: string; role: string }) => ({
          value: role.id,
          label: role.role,
          selected: role.id == userData.roles[0].id,
        }))
        console.log(transformedRoles)

        setRoles(transformedRoles)
        setLoader(false)
      } catch (error) {
        console.error('Error fetching user or roles:', error)
      } finally {
        setLoader(false)
      }
    }

    fetchUserAndRoles()
  }, [email_query])

  // Update user details
  const updateUser = async () => {
    const form = document.querySelector('form')

    if (!form!.checkValidity()) {
      setValidated(true)
      return
    }

    setLoader(true)

    // Prepare updated user data
    // @ts-ignore
    const userRoles = roles.filter((role) => role.value === selectedRole)
    const userData = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      roles: userRoles.map((role) => ({
        // @ts-ignore
        id: role.value,
        // @ts-ignore
        role: role.label,
        isCorporate: true,
      })),
      account_route: 'SP',
      isCorporate: true,
      isMerchantAdmin: false,
      enabled: true,
      verified: true,
      password: updatedUser.password,
    }

    try {
      const response = await api.post('user/update', userData)
      setLoader(false)
      if (response.data.status === '0000') {
        showToast('success', 'User updated successfully!', {
          onClose: () => {
            redirect()
          },
          autoClose: 1000,
        })
      } else {
        showToast('error', 'Error updating user!')
      }
    } catch (error) {
      console.error('Error updating user:', error)
      setLoader(false)
      showToast('error', 'An error occurred while updating the user.')
    }
  }
  const redirect = () => {
    router.push('/users/list')
  }
  return (
    <CContainer md className="px-4">
      <Loader isLoading={loader} />
      <CRow>
        {userCheck === '0' ? (
          <CCol xs={12}>
            <CCard className="mb-4">
              <CCardBody className="text-center">
                <h4>{email_query} not found.</h4>
              </CCardBody>
            </CCard>
          </CCol>
        ) : userCheck === '1' ? (
          <>
            {' '}
            <CCol xl={4}>
              <CCard style={{ border: 'none' }}>
                <CCardBody>
                  <h2 className="formTitle">Edit User</h2>
                  <p className="formDescription">Update User Information</p>
                </CCardBody>
              </CCard>
            </CCol>
            <CCol xl={8}>
              <CCard style={{ border: 'none' }}>
                <CCardBody>
                  <CRow className="mt-2">
                    <CCol xs={4}></CCol>
                    <CCol xs={4}></CCol>
                    <CCol className="text-end" xs={4}>

                      <ButtonComponent
                        itemsData={updatedUser}
                        activateUser={updateUser}
                        redirect={redirect}
                      />
                    </CCol>
                  </CRow>

                  <CRow className="mb-3">
                    <CCol lg={12} className='d-flex'>
                      <CFormLabel htmlFor="Template Status" className='my-auto me-2'>Template Status</CFormLabel>
                      <div>
                        {updatedUser.enabled ? (
                          <CBadge color="success successStatus px-4 py-2">Active</CBadge>
                        ) : (
                          <CBadge color="danger failedStatus px-4 py-2">Inactive</CBadge>
                        )}
                      </div>

                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol xs={12}>
                      <CForm className="needs-validation" noValidate validated={validated}>
                        <CRow className="mb-3">
                          <CCol lg={6}>
                            <CFormLabel htmlFor="firstName">First Name</CFormLabel>
                            <CFormInput
                              type="text"
                              id="firstName"
                              placeholder="First Name"
                              value={updatedUser.firstName}
                              onChange={(e) =>
                                setUpdatedUser({ ...updatedUser, firstName: e.target.value })
                              }
                              disabled={disabled}
                              required
                              className={validated && !updatedUser.firstName ? 'is-invalid' : ''}
                            />
                            <CFormFeedback invalid>Please type first name.</CFormFeedback>
                          </CCol>
                          <CCol lg={6}>
                            <CFormLabel htmlFor="lastName">Last Name</CFormLabel>
                            <CFormInput
                              type="text"
                              id="lastName"
                              placeholder="Last Name"
                              value={updatedUser.lastName}
                              onChange={(e) =>
                                setUpdatedUser({ ...updatedUser, lastName: e.target.value })
                              }
                              disabled={disabled}
                              required
                              className={validated && !updatedUser.lastName ? 'is-invalid' : ''}
                            />
                            <CFormFeedback invalid>Please type last name.</CFormFeedback>
                          </CCol>
                        </CRow>

                        <CRow className="mb-3">
                          <CCol lg={6}>
                            <CFormLabel htmlFor="email">Email Address</CFormLabel>
                            <CFormInput
                              placeholder="Email"
                              autoComplete="email"
                              value={updatedUser.email}
                              onChange={(e) =>
                                setUpdatedUser({ ...updatedUser, email: e.target.value })
                              }
                              type="text"
                              required
                              disabled
                              className={validated && !updatedUser.email ? 'is-invalid' : ''}
                            />
                            <CFormFeedback invalid>Please choose an email.</CFormFeedback>
                          </CCol>
                          <CCol lg={6}>
                            <CFormLabel htmlFor="role">Role</CFormLabel>
                            <CMultiSelect
                              multiple={false}
                              onChange={(choice) => setSelectedRole(choice[0].value as string)}
                              options={roles}
                              optionsStyle="text"
                              // resetSelectionOnOptionsChange
                              disabled={disabled}
                              required
                              className={validated && !selectedRole ? 'is-invalid' : ''}
                            />
                            <CFormFeedback invalid>Please choose a role.</CFormFeedback>
                          </CCol>
                        </CRow>

                        <CRow className="text-end mt-2">

                          <CCol xs={12} className="text-end">

                          {updatedUser.enabled ? (
                            <Link href="/users/list" passHref>
                              <CButton color="danger" className="text-white me-2">
                                {cancel}
                              </CButton>
                            </Link>
                          ) : (
                            <Link href="/users/list" passHref>
                              <CButton color="danger" className="text-white me-2">
                                {Close}
                              </CButton>
                            </Link>
                          )}

                            {updatedUser.enabled && (
                              <CButton
                                type="button"
                                color="primary btnCustom"
                                onClick={updateUser}
                              >
                                {update}
                                <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                              </CButton>
                            )}
                          </CCol>
                        </CRow>
                      </CForm>
                    </CCol>
                  </CRow>


                </CCardBody>
              </CCard>
            </CCol>
          </>
        ) : null}
      </CRow>
      <ToastNotification />
    </CContainer>
  )
}

export default EditUser
