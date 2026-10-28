'use client'

import api from '@/utils/axios'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react-pro'

import headImage from '@/public/images/Simpaisa Logo-01.png'
import sideImage from '@/public/images/simpaisa-main-page-img1.png'
import Loader from './../../../components/loader'
import './../../../styles/login.css'

const ForgetPassword = () => {
  const [email, setEmail] = useState('')
  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'danger' | 'warning' | null>(null)

  const [lockTimer, setLockTimer] = useState<{ seconds: number; minutes: number } | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)
  let lastSleepTime = Date.now()

  // // Cleanup interval when email changes
  // useEffect(() => {
  //   if (intervalId) {
  //     clearInterval(intervalId)
  //   }
  //   setIsLocked(false)
  //   setLockTimer(null)
  // }, [email])

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

  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      handleForgetPassword()
    }
  }

  const handleForgetPassword = () => {
    setValidated(false)
    setAlertMessage('')
    setAlertType('success')

    const form = document.querySelector('form')
    if (!form!.checkValidity()) {
      setValidated(true)
      setAlertMessage('Please enter your email address.')
      setAlertType('danger')
      return
    }

    const emailCheck = emailValidationCheck()

    if (!emailCheck) {
      setValidated(true)
      setAlertMessage('Please correct format for your email address.')
      setAlertType('danger')
      return
    }

    api
      .post('/auth/forgotPassword', { email, isCorporate: true })
      .then((response: any) => {
        console.log(response.data.status)

        if (
          (response.data && response.data.status === '0000') ||
          response.data.status === '0001' ||
          response.data.status === '0090'
        ) {
          setAlertType('success')
          setAlertMessage("We'll send a password reset link if the email is registered.")

          if (response.data.timeLeft) {
            setLockTimer(response.data.timeLeft)
            startCountdown(response.data.timeLeft.minutes, response.data.timeLeft.seconds)
          } else {
            setLockTimer({ minutes: 0, seconds: 59 })
            startCountdown(0, 59)
          }
        } else {
          throw new Error(response.data.message)
        }
      })
      .catch((error) => {
        setAlertType('danger')
        setAlertMessage('Failed to send reset link. Please try again.')
        console.error(error)
      })
      .finally(() => {
        setLoader(false)
      })
  }

  const emailValidationCheck = () => {
    try {
      // Valid TLDs - you can expand this list as needed
      const validTLDs = ['com', 'org', 'net', 'edu', 'gov', 'io', 'dev', 'pk']

      // Enhanced email regex pattern to match common structure
      const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/
      // const emailRegex = /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/

      // Validate email structure
      const hasValidStructure = emailRegex.test(email)

      // Ensure no consecutive dots and extract TLD
      const hasConsecutiveDots = email.includes('..')
      // Extract domain and split it into parts
      const domainParts = email.split('@')[1]?.split('.')
      const tld = domainParts[domainParts.length - 1]
      const isExcessiveTLD =
        domainParts.filter((part) => validTLDs.includes(part.toLowerCase())).length > 2

      // Final validation: structure + no consecutive dots + valid TLD + no excessive TLD repetitions
      const isValid = hasValidStructure && !hasConsecutiveDots && !isExcessiveTLD
      // validTLDs.includes(tld.toLowerCase()) &&

      return isValid
    } catch (error) {
      console.log(error)
      return false
    }
  }

  // @ts-ignore
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
              {/* <div className="col-lg-1"></div> */}

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
                        <h4 className="account-content__title2">Forget Password</h4>
                      </div>
                    </div>
                    <CCol md={12}>
                      <CFormLabel htmlFor="validationCustomUsername">Email</CFormLabel>
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
                      </CInputGroup>
                    </CCol>
                    <CCol xs={12}>
                      <CCol xs={12} className="text-center">
                        <CButton
                          className="full-width-button btnCustom btn-primary"
                          type="button"
                          onClick={handleForgetPassword}
                          disabled={isLocked}
                        >
                          Reset
                        </CButton>
                        <CCol className="p-1"></CCol>
                        {isLocked && lockTimer && (
                          <div className="text-success">
                            {/*@ts-ignore*/}
                            <CAlert color={alertType}>
                              We'll send a password reset link if the email is registered. You may
                              resend the request in {lockTimer.minutes}m {lockTimer.seconds}s.
                            </CAlert>
                            {/* <CAlert color={alertType}>
                              Your account is locked. Please try again in {lockTimer.minutes}m{' '}
                              {lockTimer.seconds}s.
                            </CAlert> */}
                          </div>
                        )}
                        {validated && <CAlert color={alertType!}>{alertMessage}</CAlert>}
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

export default ForgetPassword
