'use client'

import { api } from '@/utils/axios'
import {
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
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import useToastNotification from '../../../../hooks/toastNotification'
import { save } from '../../../../utils/crudBtnTexts'
import Loader from './../../../../components/loader'
import ToastNotification from '@/components/ToastNotification'
import { isValidEmail } from '@/utils/utility'

const CreateUser = () => {
  const { showToast } = useToastNotification()
  const [loader, setLoader] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [roles, setRoles] = useState([])
  const [email, setEmail] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(true)
  const [validated, setValidated] = useState(false)
  const [fname, setFname] = useState('')
  const [lname, setLname] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false) // To toggle password visibility
  const router = useRouter()

  const [emailValid, setEmailValid] = useState(true)

  const handleEmailChange = (e: any) => {
    setEmail(e.target.value)
  }

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.post('user/roles', { isCorporate: true })

        const transformedData = response.data.map((item: { id: string; role: string }) => ({
          value: item.id,
          label: item.role,
        }))

        setRoles(transformedData)
      } catch (error) {
        console.log(error)
      } finally {
      }
    }

    fetchRoles()
  }, [])

  useEffect(() => {
    checkPasswordsMatch()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, confirmPassword])

  const checkPasswordsMatch = () => {
    setPasswordMatch(password === confirmPassword)
  }

  const isStrongPassword = (password: string) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/
    return strongPasswordRegex.test(password)
  }

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const digits = '0123456789'
    const specialChars = '@$!%*?&#'

    // Function to get a random character from a string
    // @ts-ignore
    const getRandom = (chars) => chars[Math.floor(Math.random() * chars.length)]

    // Generate the random password meeting the criteria with a length of 6
    const randomPassword =
      getRandom(lowercase) +
      getRandom(uppercase) +
      getRandom(digits) +
      getRandom(specialChars) +
      getRandom(lowercase) + // Add one more random lowercase character
      getRandom(uppercase) // Add one more random uppercase character

    setPassword(randomPassword)
    setConfirmPassword(randomPassword)
    setPasswordStrength(isStrongPassword(randomPassword))
    checkPasswordsMatch()
    setShowPassword(true) // Show the password when generated
  }

  const saveUser = async () => {
    if (!emailValid) {
      showToast('error', 'Please type a correct email')
      return
    }
    const form = document.querySelector('form')

    if (!form!.checkValidity()) {
      setValidated(true)
      return
    }
    if (password != confirmPassword) {
      showToast('error', 'Passwords do not match!')
      return
    }
    if (!passwordStrength) {
      showToast('error', 'Passwords do not match the required criteria!')
      return
    }
    setLoader(true)

    // @ts-ignore
    const userRoles = roles.filter((role) => role.value === selectedRoles[0])

    // @ts-ignore
    const userData = {
      firstName: fname,
      lastName: lname,
      email: email,
      password: password,
      title: '-',
      businessName: '-',
      businessCountry: '-',
      timeZone: 'Pakistan',
      website: '.com',
      roles: userRoles.map((role) => ({
        //@ts-ignore
        id: role.value,
        //@ts-ignore
        role: role.label,
        isCorporate: true,
      })),
      account_route: 'SP',
      isCorporate: true,
      isMerchantAdmin: false,
    }

    try {
      const response = await api.post('user/save', userData)
      console.log(response)

      if (response.data.status === '0003') {
        showToast('error', 'User already exists!')
      } else if (response.data.status === '0000') {
        showToast('success', 'User created successfully!')
      } else if (response.data.status === '0085') {
        showToast('error', 'User Already Exists in Simpaisa Portal!')
      } else {
        showToast('error', (response.data.message as string).replace(/-/g, ' '))
      }
    } catch (error) {
      console.error('Error creating user:', error)
    } finally {
      setLoader(false)
    }
  }

  // @ts-ignore
  return (
    <CContainer md className="px-4">
      <Loader isLoading={loader} />
      <CRow>
        <CCol xl={4}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h2 className="formTitle">Create User</h2>
              <p className="formDescription">User Information</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xl={8}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <CForm className="needs-validation" noValidate validated={validated}>
                <CRow className="mb-3">
                  <CCol lg={6}>
                    <CFormLabel htmlFor="firstName">First Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="firstName"
                      placeholder="First Name"
                      value={fname}
                      onChange={(e) => setFname(e.target.value)}
                      required
                      className={validated && !fname ? 'is-invalid' : ''}
                    />
                    <CFormFeedback invalid>Please type first name.</CFormFeedback>
                  </CCol>
                  <CCol lg={6}>
                    <CFormLabel htmlFor="lastName">Last Name</CFormLabel>
                    <CFormInput
                      type="text"
                      id="lastName"
                      placeholder="Last Name"
                      value={lname}
                      onChange={(e) => setLname(e.target.value)}
                      required
                      className={validated && !lname ? 'is-invalid' : ''}
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
                      value={email}
                      onChange={handleEmailChange}
                      onKeyUp={() => setEmailValid(isValidEmail(email))} // Trigger regex check on keyup
                      type="text"
                      id="validationCustomUsername"
                      aria-describedby="inputGroupPrepend"
                      required
                    />
                    <CFormFeedback invalid>Please choose an email.</CFormFeedback>
                    {!emailValid && email && (
                      <div style={{ color: 'red' }}>Please type a correct email.</div>
                    )}
                  </CCol>
                  <CCol lg={6}>
                    <CFormLabel htmlFor="role">Role</CFormLabel>
                    <CMultiSelect
                      multiple={false}
                      onChange={(choice) => {
                        //@ts-ignore
                        setSelectedRoles([choice[0].value])
                      }}
                      options={roles}
                      optionsStyle="text"
                      resetSelectionOnOptionsChange
                      required
                      className={validated && !roles.length ? 'is-invalid' : ''}
                    />
                    <CFormFeedback invalid>Please choose a role.</CFormFeedback>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol lg={6}>
                    <CRow className="mb-1">
                      <CCol lg={6}>
                        <CFormLabel htmlFor="password">Password</CFormLabel>
                      </CCol>
                      <CCol className="text-end" lg={6}>
                        <a
                          className="btn btn-info btn-sm text-white font-12 border-0"
                          onClick={(e) => {
                            e.preventDefault()
                            generatePassword()
                          }}
                        >
                          Generate Password
                        </a>
                      </CCol>
                    </CRow>
                    <CInputGroup className="has-validation password-f">
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                          const newPassword = e.target.value
                          setPassword(newPassword)
                          setPasswordStrength(isStrongPassword(newPassword))
                        }}
                        required
                        className={validated && !password ? 'is-invalid' : ''}
                      />
                      <CFormFeedback invalid>Please choose a password.</CFormFeedback>
                    </CInputGroup>
                    {password && !passwordStrength && (
                      <p style={{ color: 'red' }}>
                        Password must be at least 8 characters long and include uppercase,
                        lowercase, number, and special character.
                      </p>
                    )}
                  </CCol>

                  <CCol lg={6}>
                    <CFormLabel htmlFor="confirmPassword" className="mb-3">
                      Confirm Password
                    </CFormLabel>
                    <CFormInput
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={validated && !confirmPassword ? 'is-invalid' : ''}
                    />
                    <CFormFeedback invalid>Please confirm the password.</CFormFeedback>
                    {!passwordMatch && <p style={{ color: 'red' }}>Passwords do not match.</p>}
                  </CCol>
                </CRow>

                <CRow className="text-end">
                  <CCol xs={12}>
                    <CButton type="button" color="primary btnCustom" onClick={saveUser}>
                      {save}
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

export default CreateUser
