'use strict'
import { api } from '@/utils/axios'
import { cibIfixit, cilBan, cilCheckAlt, cilCheckCircle } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCol, CModal, CModalBody, CRow } from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import useToastNotification from '../../../../hooks/toastNotification'
import { activate, cancel, confirm, deactivate } from '../../../../utils/crudBtnTexts'
interface ButtonsProps {
  itemsData: any
  activateUser: () => void
  redirect: () => void
}
import Image from 'next/image';
import successIcon from '@/public/images/ss.gif'
import failedIcon from '@/public/images/ff.gif'
import otherIcon from '@/public/images/alert.gif'

const ButtonComponent: React.FC<ButtonsProps> = ({ itemsData, activateUser }) => {
  const router = useRouter()
  const { showToast } = useToastNotification()
  const [modalVisible, setModalVisible] = useState(false)
  const handleAction = (user: any) => {
    // setSelectedUser(user);
    setModalVisible(true)
  }
  const confirmDelete = async () => {
    try {
      // @ts-ignore
      await api
        .post('user/delete', { email: itemsData.email, isCorporate: true })
        .then((response) => {
          // @ts-ignore
          if (response.data.status == '0000') {
            showToast('error', 'User deactivated successfully!', {
              onClose: () => {
                router.push('/users/list')
              },
              autoClose: 1000,
            })
          }
        })
        .catch((error: any) => {
          console.error(error)
        })
      setModalVisible(false)
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }
  return (
    <>
      <CButton
        onClick={() => handleAction(itemsData)}
        className=""
        color={!itemsData.enabled ? 'outline-success btn-sm' : 'outline-danger btn-sm'}
      >
        {!itemsData.enabled ? (
          <>
            <CIcon icon={cilCheckAlt} size="sm" /> {activate}
          </>
        ) : (
          <>
            <CIcon icon={cilBan} size="sm" /> {deactivate}
          </>
        )}
      </CButton>
      <CModal visible={modalVisible} alignment="center" onClose={() => setModalVisible(false)}>
        <CModalBody>
          {itemsData.enabled ? (
            <CRow className="justify-content-center failedIconGif">
              {/* <CIcon icon={cibIfixit} size="7xl" /> */}
              <Image src={failedIcon} alt="failedIcon"></Image>

            </CRow>
          ) : (
            <CRow className="justify-content-center successIconGif">
              {/* <CIcon icon={cilCheckCircle} size="7xl" /> */}
              <Image src={successIcon} alt="successIcon"></Image>
            </CRow>
          )}

          <CRow className="c-height"></CRow>
          <p className="delete-ask">
            Do you want to {!itemsData.enabled ? 'activate' : 'deactivate'} this record?
          </p>
          <CRow className="c-height">
         
            <CCol xs={6} className="d-grid">
              <CButton
                className="text-light"
                color="primary btnCustom"
                onClick={() => {
                  if (!itemsData.enabled) {
                    activateUser()
                    setModalVisible(false)
                  } else {
                    confirmDelete().then(() => {
                      setModalVisible(false)
                    })
                  }
                }}
              >
                {confirm}
              </CButton>
            </CCol>

            <CCol xs={6} className="d-grid text-light">
              <CButton color="danger" className="text-light" onClick={() => setModalVisible(false)}>
                {cancel}
              </CButton>
            </CCol>
          </CRow>
        </CModalBody>
      </CModal>
    </>
  )
}

export default ButtonComponent
