'use client'

import { useAuth } from '@/AuthContext'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import headImage from '@/public/images/Simpaisa Logo-01.png'
import sideImage from '@/public/images/simpaisa-main-page-img1.png'
import store from '@/store'
import api from '@/utils/axios'
import { cibIfixit } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
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
  CModal,
  CModalBody,
  CRow,
  CSpinner,
} from '@coreui/react-pro'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Loader from './../../../components/loader'
import './../../../styles/login.css'

const Login = () => {
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loader, setLoader] = useState(false)
  const [incorrectCredentials, setIncorrectCredentials] = useState('')
  const { login } = useAuth()
  const [validated, setValidated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loginMessage, setLoginMessage] = useState('')
  const { showToast } = useToastNotification()
  const [reason] = useLocalStorage('reason')

  const [lockTimer, setLockTimer] = useState<{ seconds: number; minutes: number } | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  let lastSleepTime = Date.now()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      setEmail('muhammad.atif@simpaisa.com')
      setPassword('Admin123@')
    }

    if (reason === 'inactivity') {
      showToast('info', 'Session Logout due to User Inactivity')
      localStorage.removeItem('reason')
    }
  }, [])

  // Cleanup interval when email changes
  useEffect(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
    setIsLocked(false)
    setLockTimer(null)
  }, [email])

  useEffect(() => {
    if (isLocked) {
      lastSleepTime = Date.now()
    }
  }, [isLocked])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLocked) {
        const elapsedSeconds = Math.floor((Date.now() - lastSleepTime) / 1000)
        setLockTimer((prevTimer) => {
          if (!prevTimer) return null

          let remainingSeconds = prevTimer.minutes * 60 + prevTimer.seconds - elapsedSeconds
          if (remainingSeconds <= 0) {
            setIsLocked(false)
            return null
          }

          return {
            minutes: Math.floor(remainingSeconds / 60),
            seconds: remainingSeconds % 60,
          }
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isLocked])

  useEffect(() => {
    const auth = localStorage.getItem('authToken')
    if (auth) {
      router.push('/dashboard/main')
    } else {
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '100vh' }}
        >
          <CSpinner color="info" style={{ width: '5rem', height: '5rem' }} />
        </div>
      </div>
    )
  }

  const startCountdown = (minutes: number, seconds: number) => {
    setIsLocked(true)
    const totalSeconds = minutes * 60 + seconds
    const unlockTime = Date.now() + totalSeconds * 1000

    const updateTimer = () => {
      const remaining = Math.max(0, unlockTime - Date.now())
      setLockTimer({
        minutes: Math.floor(remaining / 60000),
        seconds: Math.floor((remaining % 60000) / 1000),
      })
      if (remaining > 0) {
        requestAnimationFrame(updateTimer)
      } else {
        setIsLocked(false)
        setLockTimer(null)
      }
    }
    requestAnimationFrame(updateTimer)
  }

  const handleLogin = () => {
    const form = document.querySelector('form')
    if (!form!.checkValidity()) {
      setValidated(true)
      if (email == '' && password == '') {
        setIncorrectCredentials('Please fill email and password fields')
      } else if (password == '') {
        setIncorrectCredentials('Please fill password field')
      } else {
        setIncorrectCredentials('Please fill email field')
      }

      return
    }

    const data = {
      email: email,
      password: password,
      isCorporate: true,
    }

    setLoader(true)
    api
      .post('auth/v3/login', { ...data, isCorporate: true })
      .then((response) => {
        setIncorrectCredentials('')
        if (response.data.status == '0000') {
          setLoginMessage('Successfully logged in.....')
          if (response.data.isExpired == false) {
            const responseData = response.data
            const loginData = {
              status: responseData.status,
              message: responseData.message,
              token: responseData.token,
              email: responseData.email,
              firstName: responseData.firstName,
              lastName: responseData.lastName,
              privileges: responseData.privileges,
              role: responseData.role,
              id: responseData.id,
              sessionTime: responseData.sessionTime ?? 15,
            }
            store.dispatch({ type: 'setNavItems', navItems: responseData.privileges })
            login(loginData)

            // router.replace('dashboard')
          } else {
            setDeleteModalVisible(true)
          }
        } else if (response.data.status == '0041') {
          showToast(
            'error',
            'Your account is already logged in on another device. Kindly log out from other sessions to proceed',
          )
        } else if (response.data.status == '0069' && response.data.inactive90Days == true) {
          showToast(
            'error',
            'Your account has been deactivated due to 90 days of inactivity. Please contact support.',
          )
        } else if (response.data.status == '0089') {
          showToast('error', 'Your account has been locked due to multiple failed login attempts.')
          console.log(response.data)

          if (response.data.timeLeft) {
            setLockTimer(response.data.timeLeft)
            startCountdown(response.data.timeLeft.minutes, response.data.timeLeft.seconds)
          }
        } else {
          let errmesg = response.data.message
          setIncorrectCredentials(errmesg.replace(/-/g, ' '))
        }
      })
      .catch((error) => {
        const errmesg = error.message

        console.error(error)
      })
      .finally(() => {
        setLoader(false)
      })
  }
  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }
  const forget = async () => {
    setDeleteModalVisible(true)
    router.replace('/forget-password')
  }
  return (
    <>
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
                    <Image className="loginImage" src={sideImage} alt="Loading" />
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="border p-4 account-wrapper">
                    <CForm className="row g-4 needs-validation" noValidate validated={validated}>
                      <div className="account-content">
                        <div className="account-content__top">
                          <h4 className="account-content__title1">
                            <span className="account-content__title-colored">Corporate Portal</span>
                          </h4>
                        </div>
                        <div className="account-content__top">
                          <h4 className="account-content__title2">Sign In to Your Dashboard </h4>
                        </div>
                      </div>
                      <CCol md={12}>
                        <CFormLabel htmlFor="validationCustomUsername">Username</CFormLabel>
                        <CInputGroup className="has-validation">
                          <CInputGroupText id="inputGroupPrepend">
                            {' '}
                            <i className="bi bi-envelope-at-fill"></i>
                          </CInputGroupText>
                          <CFormInput
                            placeholder="Email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={handleKeyDown}
                            type="text"
                            id="validationCustomUsername"
                            aria-describedby="inputGroupPrepend"
                            required
                          />
                          <CFormFeedback invalid>Please choose a username.</CFormFeedback>
                        </CInputGroup>
                      </CCol>
                      <CCol md={12}>
                        <CFormLabel htmlFor="validationCustomPassword">Password</CFormLabel>
                        <CInputGroup className="has-validation">
                          <CInputGroupText id="inputGroupPrepend">
                            <i className="bi bi-fingerprint"></i>
                          </CInputGroupText>
                          <CFormInput
                            id="validationCustomPassword"
                            aria-describedby="inputGroupPrepend"
                            required
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                          />
                          <CFormFeedback invalid>Please choose a password.</CFormFeedback>
                        </CInputGroup>
                      </CCol>
                      <CCol xs={12} className="mt-2">
                        <Link href="/forget-password" className="forgot-passwrod">
                          Forget Your Password?
                        </Link>
                      </CCol>
                      <CCol xs={12} className="text-center">
                        {loginMessage ? (
                          <div className="login-message">{loginMessage}</div>
                        ) : (
                          <CButton
                            className="full-width-button btnCustom btn-primary"
                            type="button"
                            onClick={handleLogin}
                            disabled={isLocked} // Disable button when locked
                          >
                            Login
                          </CButton>
                        )}

                        {/* Show Incorrect Credentials Message */}
                        {incorrectCredentials && (
                          <div className="text-danger">
                            <CAlert color="danger">{incorrectCredentials}</CAlert>
                          </div>
                        )}

                        {/* Show Lock Timer Below Login Button */}
                        {isLocked && lockTimer && (
                          <p className="text-danger mt-2">
                            Your account is locked. Please try again in {lockTimer.minutes}m{' '}
                            {lockTimer.seconds}s.
                          </p>
                        )}
                      </CCol>
                    </CForm>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <CModal
        visible={deleteModalVisible}
        alignment="center"
        onClose={() => {
          setDeleteModalVisible(false)
          setLoginMessage('')
        }}
      >
        <CModalBody>
          <CRow className="justify-content-center mb-3 delete-icon">
            <CIcon icon={cibIfixit} size="7xl" />
          </CRow>

          <CRow className="c-height"></CRow>
          <p className="delete-ask">
            Password Expired: For continued access to your account, please change your password.
          </p>
          <CRow>
            <CCol xs={12} className="d-grid mb-3">
              <CButton
                color="primary"
                onClick={() => {
                  forget()
                  setLoginMessage('')
                }}
              >
                OK
              </CButton>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>
      <ToastNotification />
    </>
  )
}

export default Login
