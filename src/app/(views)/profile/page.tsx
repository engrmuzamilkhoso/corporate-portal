'use client'

import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { api } from '@/utils/axios'
import { cilList } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CMultiSelect,
  CRow,
} from '@coreui/react-pro'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const EditUser = () => {
  const searchParams = useSearchParams()
  const email_query = searchParams.get('email')
  const { showToast } = useToastNotification()
  const [loader, setLoader] = useState(true)
  // const [password, setPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState('');
  const [roles, setRoles] = useState([])
  // const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const [validated, setValidated] = useState(false)
  const [userCheck, setUserCheck] = useState('1')
  const [selectedRole, setSelectedRole] = useState('')
  const [updatedUser, setUpdatedUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    roleId: '',
    password: '',
  })

  const router = useRouter()

  useEffect(() => {
    const fetchUserAndRoles = async () => {
      try {
        // Fetch user data
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
          })
        }

        // Fetch roles data
        const rolesResponse = await api.post('user/roles', { isCorporate: true })
        const rolesData = rolesResponse.data.map((item: { id: string; role: string }) => ({
          value: item.id,
          label: item.role,
          selected: item.id == userData.roles[0].id,
        }))
        console.log(userData.roles[0].id)
        console.log(rolesData)
        setRoles(rolesData)
        setLoader(false)
      } catch (error) {
        console.error('Error fetching user or roles:', error)
      }
    }

    fetchUserAndRoles()
  }, [email_query])

  const updateUser = async () => {
    const form = document.querySelector('form')

    if (!form!.checkValidity()) {
      setValidated(true)
      return
    }
    setLoader(true)
    // @ts-ignore
    const userRoles = roles.filter((role) => role.value === selectedRole)

    const userData = {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      title: '-',
      businessName: '-',
      businessCountry: '-',
      timeZone: 'Pakistan',
      website: '.com',
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
      await api.post('user/update', userData).then((response) => {
        if (response.data.status == '0000') {
          setLoader(false)
          showToast('success', 'User updated successfully!')
          //router.replace('/users')
        }

        //console.log('User updated:', response.data);
      })
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  return (
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
        <CCol xs={12}>
          <Loader isLoading={loader} />
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Edit User</strong>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol xs={8}></CCol>
                <CCol className="text-end" xs={4}>
                  <Link href="/users" passHref>
                    <CButton variant="outline" color="primary" size="sm">
                      <CIcon icon={cilList} size="sm" /> User List
                    </CButton>
                  </Link>
                </CCol>
              </CRow>
              <CForm className="needs-validation" noValidate validated={validated}>
                <CRow>
                  <CCol lg={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="firstName">First Name</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          type="text"
                          id="firstName"
                          name="firstName"
                          placeholder="First Name"
                          value={updatedUser.firstName}
                          onChange={(e) =>
                            setUpdatedUser({ ...updatedUser, firstName: e.target.value })
                          }
                          aria-describedby="inputGroupPrepend"
                          required
                        />
                        <CFormFeedback invalid>Please type first name.</CFormFeedback>
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol lg={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="lastName">Last Name</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          type="text"
                          name="lastName"
                          placeholder="Last Name"
                          id="lastName"
                          value={updatedUser.lastName}
                          onChange={(e) =>
                            setUpdatedUser({ ...updatedUser, lastName: e.target.value })
                          }
                          aria-describedby="inputGroupPrepend"
                          required
                        />
                        <CFormFeedback invalid>Please type last name.</CFormFeedback>
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol lg={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="email">Email Address</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          placeholder="Email"
                          autoComplete="email"
                          value={updatedUser.email}
                          disabled // Email should not be editable
                        />
                        <CFormFeedback invalid>Please choose an email.</CFormFeedback>
                      </CInputGroup>
                    </div>
                  </CCol>
                  <CCol lg={6}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="role">Role</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CMultiSelect
                          multiple={false}
                          // @ts-ignore
                          onChange={(choice) => setSelectedRole(choice[0].value)}
                          options={roles}
                          optionsStyle="text"
                          aria-describedby="validationCustom04Feedback"
                          id="validationCustom04"
                          required
                        />
                        <CFormFeedback invalid>Please choose a role.</CFormFeedback>
                      </CInputGroup>
                    </div>
                  </CCol>
                </CRow>
                <CRow className="text-end">
                  <CCol xs={12}>
                    <CButton onClick={updateUser} type="button" className="w-10" color="primary">
                      Update
                    </CButton>
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      ) : null}
      <ToastNotification />
    </CRow>
  )
}

export default EditUser
