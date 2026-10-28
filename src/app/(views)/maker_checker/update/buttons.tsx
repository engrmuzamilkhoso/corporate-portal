'use client'

import Loader from '@/components/loader'
import useToastNotification from '@/hooks/toastNotification'
import { api } from '@/utils/axios'
import {
  cibIfixit,
  cilBan,
  cilCheckCircle
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton, CCol, CModal, CModalBody, CRow,
} from '@coreui/react-pro'

import {activate, deactivate} from "@/utils/crudBtnTexts"
import React, { useState } from 'react'

import Image from 'next/image';
import successIcon from '@/public/images/ss.gif'
import failedIcon from '@/public/images/ff.gif'
import otherIcon from '@/public/images/alert.gif'


interface ButtonsProps {
  itemsData: any;
}

const Buttons: React.FC<ButtonsProps> = ({ itemsData }) => {
  const { showToast } = useToastNotification()
  const [loader, setLoader] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  async function handleStatusChange(itemsData: any, status: boolean) {
    try {
      setLoader(true)
      const response = await api.post('/corporate/makerCheckerRole/update', {
        id: itemsData.id,
        userId: itemsData.userId,
        pageCode: itemsData.pageCode,
        role: itemsData.role,
        status: status,
        isValid: itemsData.isValid,
      })
      if (response.status === 200) {
        const data = response.data
        if (data.status !== '0000') {
          showToast('error', (data.message as string).replace(/-/g, ' '))
        } else {
          showToast('success', `status ${status ? 'activated' : 'deactivated'} successfully!`)
          setTimeout(() => {
          //  router.push('/maker_checker/list')

          }, 1000);
        }
      } else {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      console.log(error)
      showToast('error', 'Error updating status')
    } finally {
      setDeleteModalVisible(false)
      setLoader(false)
    }
  }


  return (
    <>
      <>
        <Loader isLoading={loader}/>
        {itemsData.status ? (
          <>
            {/*@ts-ignore*/}
            <CButton size="sm" className="" color="outline-danger" onClick={() => setDeleteModalVisible(true)}>
              <CIcon icon={cilBan} size="sm" /> {deactivate} </CButton>
          </>
        ) : (
          <> {/*@ts-ignore*/}
            <CButton className="" size="sm" color="outline-success" onClick={() => setDeleteModalVisible(true)}>
              <CIcon icon={cilCheckCircle} size="sm" /> {activate}</CButton>
          </>
        )}
        <CModal visible={deleteModalVisible} alignment="center" onClose={() => setDeleteModalVisible(false)}>
          <CModalBody>
              {itemsData.status ? (
                <CRow className="justify-content-center failedIconGif">
                  {/* <CIcon icon={cibIfixit} size="7xl" /> */}
                  <Image src={failedIcon} alt="failedIcon"></Image>
                </CRow>
              ) : (
                <CRow className="justify-content-center successIconGif">
                  {/* <i className="bi bi-check-circle-fill" style={{fontSize:"75px",color:"limegreen"}}></i> */}
                  <Image src={successIcon} alt="successIcon"></Image>
                </CRow>
              )}


            <CRow className="c-height" ></CRow>
            {itemsData.status ? (
            <p className="delete-ask">Do you want to inactive this record?</p>
            ) : (
              <p className="delete-ask">Do you want to active this record?</p>
            )}
            <CRow>
             
              <CCol xs={6} className="d-grid mb-3">
                <CButton className="text-light btnCustom" color="danger" onClick={() => handleStatusChange(itemsData, !itemsData.status as boolean)}>Confirm
                </CButton>
              </CCol>
              <CCol xs={6} className="d-grid mb-3">
                <CButton color="danger" className='text-white' onClick={() => setDeleteModalVisible(false)}>
                  Cancel
                </CButton>
              </CCol>
            </CRow>
          </CModalBody>

        </CModal>
      </>
    </>
  )
}

export default Buttons
