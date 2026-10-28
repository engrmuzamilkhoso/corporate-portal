'use client'

import api from '@/utils/axios'
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormFeedback,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CTooltip,
} from '@coreui/react-pro'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import headImage from '@/public/images/Simpaisa Logo-01.png'
import sideImage from '@/public/images/simpaisa-main-page-img1.png'
import { cilCheckCircle, cilXCircle } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import Loader from './../../../components/loader'
import './../../../styles/login.css'
const ChangePassword = () => {
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('token')
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'danger' | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(true)
  const [passwordMatch, setPasswordMatch] = useState(true)

  useEffect(() => {
    checkPasswordsMatch()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password, confirmPassword])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleChangePassword()
    }
  }

  const checkPasswordsMatch = () => {
    setPasswordMatch(password === confirmPassword)
    console.log(password + '-' + confirmPassword)
  }

  const handleChangePassword = async () => {
    const form = document.querySelector('form')

    if (form && !form.checkValidity()) {
      setValidated(true)
      setAlertMessage('Please fill out the form correctly.')
      setAlertType('danger')
      return
    }

    setLoader(true)

    try {
      const response = await api.post('/auth/v2/changePassword', {
        password,
        token: resetToken,
        isCorporate: true,
      })

      if (response.data?.status === '0000') {
        setAlertType('success')
        setAlertMessage('Your password has been changed successfully.')
        router.push('/login')
      } else {
        throw new Error(response.data.message)
      } //@ts-ignore
    } catch (error: Error) {
      setAlertType('danger')
      setAlertMessage(error.message)
    } finally {
      setLoader(false)
    }
  }

  const isStrongPassword = (password: string) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/
    return strongPasswordRegex.test(password)
  }

  return (
    <div className="main-div">
      <Loader isLoading={loader} />
      <section className="account">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center p-5">
            <Image className="headimage" src={headImage} alt="head" />
          </div>
        </div>
        <div className="container">
          <div className="account-inner">
            <div className="row align-content-center gy-5 flex-wrap-reverse">
              <div className="col-lg-6 pe-lg-5">
                <div className="account-thumb">
                  <Image src={sideImage} alt="Loading" />
                </div>
              </div>
              <div className="col-lg-5">
                <div className="border border-dark-subtle p-4 account-wrapper">
                  <CForm className="row g-4 needs-validation" noValidate validated={validated}>
                    <div className="account-content">
                      <div className="account-content__top">
                        <h4 className="account-content__title1">
                          <span className="account-content__title-colored">Corporate Portal</span>
                        </h4>
                      </div>
                      <div className="account-content__top">
                        <h4 className="account-content__title2">Change Password</h4>
                      </div>
                    </div>
                    <CCol md={12}>
                      <CFormLabel htmlFor="password">Password</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CInputGroupText id="inputGroupPrepend">
                          <i className="bi bi-fingerprint"></i>
                        </CInputGroupText>
                        <CFormInput
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => {
                            const newPassword = e.target.value
                            setPassword(newPassword)
                            setPasswordStrength(isStrongPassword(newPassword))
                            checkPasswordsMatch() // Check match on password change
                          }}
                          required
                        />
                        <CFormFeedback invalid>Please choose a password.</CFormFeedback>
                      </CInputGroup>
                      {password && !passwordStrength && (
                        <CTooltip
                          className="tooltip_changepass"
                          visible={true}
                          content={
                            <ol style={{ textAlign: 'left', margin: 0 }}>
                              <li className="text-center">
                                <strong>PASSWORD TIPS</strong>
                              </li>
                              <li>
                                <CIcon
                                  icon={password.length >= 8 ? cilCheckCircle : cilXCircle}
                                  className={
                                    password.length >= 8
                                      ? 'me-2 text-springgreen'
                                      : 'me-2 text-orangered'
                                  }
                                />
                                8 characters long
                              </li>
                              <li>
                                <CIcon
                                  icon={/[A-Z]/.test(password) ? cilCheckCircle : cilXCircle}
                                  className={
                                    /[A-Z]/.test(password)
                                      ? 'me-2 text-springgreen'
                                      : 'me-2 text-orangered'
                                  }
                                />
                                One uppercase letter
                              </li>
                              <li>
                                <CIcon
                                  icon={/[a-z]/.test(password) ? cilCheckCircle : cilXCircle}
                                  className={
                                    /[a-z]/.test(password)
                                      ? 'me-2 text-springgreen'
                                      : 'me-2 text-orangered'
                                  }
                                />
                                One lowercase letter
                              </li>
                              <li>
                                <CIcon
                                  icon={/\d/.test(password) ? cilCheckCircle : cilXCircle}
                                  className={
                                    /\d/.test(password)
                                      ? 'me-2 text-springgreen'
                                      : 'me-2 text-orangered'
                                  }
                                />
                                One number
                              </li>
                              <li>
                                <CIcon
                                  icon={
                                    /[!@#$%^&*(),.?":{}|<>]/.test(password)
                                      ? cilCheckCircle
                                      : cilXCircle
                                  }
                                  className={
                                    /[!@#$%^&*(),.?":{}|<>]/.test(password)
                                      ? 'me-2 text-springgreen'
                                      : 'me-2 text-orangered'
                                  }
                                />
                                One special character
                              </li>
                            </ol>
                          }
                          placement="left"
                        >
                          <span></span>
                        </CTooltip>
                      )}
                    </CCol>
                    <CCol md={12}>
                      <CFormLabel htmlFor="confirmPassword">Confirm Password</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CInputGroupText id="inputGroupPrepend">
                          <i className="bi bi-fingerprint"></i>
                        </CInputGroupText>
                        <CFormInput
                          id="confirmPassword"
                          aria-describedby="inputGroupPrepend"
                          required
                          type="password"
                          placeholder="Confirm New Password"
                          autoComplete="current-password"
                          value={confirmPassword}
                          onChange={(e) => {
                            const newConfirmPassword = e.target.value
                            setConfirmPassword(newConfirmPassword)
                            checkPasswordsMatch() // Check match on confirm password change
                          }}
                          onKeyDown={handleKeyDown}
                        />
                        <CFormFeedback invalid>Please enter the confirm password.</CFormFeedback>
                      </CInputGroup>
                      {!passwordMatch && <p style={{ color: 'red' }}>Passwords do not match.</p>}
                    </CCol>
                    <CCol xs={12}>
                      <CCol xs={12} className="text-center">
                        <CButton
                          color="outline-primary"
                          className="full-width-button primary-btn btnCustom"
                          type="button"
                          onClick={handleChangePassword}
                          disabled={!passwordStrength || !passwordMatch}
                        >
                          Change Password
                        </CButton>

                        {alertMessage && (
                          <div className={alertType === 'danger' ? 'text-danger' : 'text-success'}>
                            {/*@ts-ignore*/}
                            <CAlert color={alertType}>{alertMessage}</CAlert>
                          </div>
                        )}
                      </CCol>
                    </CCol>
                  </CForm>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ChangePassword
