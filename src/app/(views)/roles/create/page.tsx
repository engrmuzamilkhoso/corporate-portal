'use client'

import { api } from '@/utils/axios'
import { cilList } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
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
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Loader from './../../../../components/loader'
import ToastNotification from './../../../../components/ToastNotification'
import useToastNotification from '../../../../hooks/toastNotification'
import { save } from '../../../../utils/crudBtnTexts'
type Privilege = {
  id: string
  value: string
  code: string
  name: string
  type: string
  path: string
  title: string
  rtlTitle: string | null
  icon: string | null
  merchantDefault: boolean
  adminDefault: boolean
  createTab: boolean
  sortOrder: number
  active: boolean
  isSubMenu: boolean
  subMenuKey: string | null
  isCorporate: boolean
  label: string
}

const CreateRole = () => {
  const [roleData, setRoleData] = useState({
    role: '',
    privileges: [] as Privilege[],
    isCorporate: true,
  })
  const { showToast } = useToastNotification()
  const [loader, setLoader] = useState(false)
  const [privilegesOptions, setPrivilegesOptions] = useState<any[]>([])
  const [validated, setValidated] = useState(false)
  const router = useRouter()

  const [selectedPrivileges, setSelectedPrivileges] = useState<any[]>([])

  // Fetch privileges on component mount
  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        setLoader(true)
        const response = await api.post('/privileges/all', {
          isCorporate: true,
        })

        const customPrivileges = response.data.map((privilege: Privilege) => ({
          ...privilege,
          label: privilege.name,
        }))

        // Set privileges options (parent-child relationship)
        const options = customPrivileges.reduce((acc: any, privilege: Privilege) => {
          if (privilege.isSubMenu) {
            acc.push({
              ...privilege,
              options: customPrivileges
                .filter((child: Privilege) => child.subMenuKey === privilege.code)
                .map((child: Privilege) => ({
                  ...child,
                  label: child.title,
                  value: child.id,
                })),
            })
          } else if (!privilege.subMenuKey) {
            acc.push({ ...privilege, value: privilege.id })
          }
          return acc
        }, [])

        setPrivilegesOptions(options)
      } catch (error) {
        showToast('error', 'Failed to load privileges')
        console.error('Error fetching privileges:', error)
      } finally {
        setLoader(false)
      }
    }

    fetchPrivileges()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePrivilegesChange = () => {
    let selectedPrivilegesOptions = selectedPrivileges.map((option: Privilege) => option)

    // Ensure parent privilege is selected if child is selected
    selectedPrivilegesOptions.forEach((selectedPrivilege) => {
      if (!selectedPrivilege.isSubMenu && selectedPrivilege.subMenuKey) {
        const parentPrivilege = privilegesOptions.find(
          (privilege: Privilege) => privilege.code === selectedPrivilege.subMenuKey,
        )
        if (parentPrivilege && !selectedPrivilegesOptions.includes(parentPrivilege)) {
          selectedPrivilegesOptions = [...selectedPrivilegesOptions, parentPrivilege]
        }
      }
    })

    // Remove duplicate privileges
    const uniquePrivileges = Array.from(new Set(selectedPrivilegesOptions))

    setRoleData({ ...roleData, privileges: uniquePrivileges })
    return uniquePrivileges
  }

  // Save role
  const saveRole = async () => {
    const form = document.querySelector('form')
    if (!form!.checkValidity()) {
      setValidated(true)
      return
    }

    setLoader(true)
    try {
      const privileges = handlePrivilegesChange()
      const updatedRoleData = { ...roleData, privileges: privileges }
      const response = await api.post('role/save', updatedRoleData)
      if (response.data.status === '0003') {
        showToast('error', 'Role already exists!')
      } else if (response.data.status === '0000') {
        showToast('success', 'Role created successfully!', {
          onClose: () => {
            router.push('/roles/list')
          },
          autoClose: 1000,
        })
      }else if(response.data.status === '0062'){
        showToast('error', response.data.message)
      }
    } catch (error) {
      showToast('error', 'Error creating role')
      console.error('Error creating role:', error)
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
              <h2 className="formTitle">Create Role</h2>
              <p className="formDescription">Role Details</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={8}>
          <CCard
            style={{ border: 'none' }}
            // className="mb-4"
          >
            {/* <CCardHeader>
              <strong>Create Role</strong>
            </CCardHeader> */}
            <CCardBody>
              <CRow className="p-2">
                <CCol xs={4}></CCol>
                <CCol xs={4}></CCol>
                <CCol className="text-end" xs={4}>
                  <Link href="/roles/list" passHref>
                    <CButton className="btnCustom" color="primary" variant="outline" size="sm">
                      <CIcon icon={cilList} size="sm" /> Role List
                    </CButton>
                  </Link>
                </CCol>
              </CRow>

              <CForm className="needs-validation" noValidate validated={validated}>
                <CRow>
                  <CCol lg={12}>
                    <div className="mb-3">
                      <CFormLabel htmlFor="role">Role</CFormLabel>
                      <CInputGroup className="has-validation">
                        <CFormInput
                          type="text"
                          id="role"
                          name="Role"
                          placeholder="Role"
                          value={roleData.role}
                          onChange={(e) => setRoleData({ ...roleData, role: e.target.value })}
                          aria-describedby="inputGroupPrepend"
                          required
                        />
                        <CFormFeedback invalid>Please type Role.</CFormFeedback>
                      </CInputGroup>
                    </div>
                  </CCol>

                  <CCol lg={12}>
                    <div className="mb-3 role-list">
                      <CFormLabel htmlFor="privilegesOptions">Privileges</CFormLabel>
                      <CMultiSelect
                        id="privilegesOptions"
                        options={privilegesOptions}
                        onChange={setSelectedPrivileges}
                        optionsMaxHeight={350}
                        required
                        className={validated && !selectedPrivileges.length ? 'is-invalid privilegesOptions' : 'privilegesOptions'}
                      />
                      <CFormFeedback invalid>Please Select Privileges.</CFormFeedback>
                    </div>
                  </CCol>
                </CRow>
                <CRow className="text-end">
                  <CCol xs={12}>
                    <CButton
                      type="button"
                      color="primary btnCustom"
                      onClick={saveRole}
                      style={{ marginLeft: '7px' }}
                    >
                      {save}
                      <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                    </CButton>
                    {/* <CButton onClick={saveRole} type="button" className="w-10" color="primary">
                      {save}
                    </CButton> */}
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

export default CreateRole
