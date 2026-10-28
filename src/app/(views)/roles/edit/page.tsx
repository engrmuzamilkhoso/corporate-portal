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
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import useToastNotification from '../../../../hooks/toastNotification'
import Loader from './../../../../components/loader'
import ToastNotification from './../../../../components/ToastNotification'
import { cancel, update } from '../../../../utils/crudBtnTexts'
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

const EditRole = () => {
  const [roleData, setRoleData] = useState<{
    id: string
    role: string
    privileges: Privilege[]
    isCorporate: boolean
  }>({
    id: '',
    role: '',
    privileges: [],
    isCorporate: true,
  })
  const { showToast } = useToastNotification()
  const [loader, setLoader] = useState(false)
  const [privilegesOptions, setPrivilegesOptions] = useState<any[]>([])
  const [validated, setValidated] = useState(false)
  const [selectedPrivilegesSet, setSelectedPrivilegesSet] = useState<Privilege[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const role = searchParams.get('role')
    const id = searchParams.get('id')
    const isCorporate = searchParams.get('isCorporate') === 'true'
    const privilegesString = searchParams.get('privileges')

    if (role && id) {
      const privileges = privilegesString ? JSON.parse(privilegesString) : []
      setRoleData({ id, role, privileges, isCorporate })
    }
  }, [searchParams])

  const fetchingParams = () => {
    const privilegesString = searchParams.get('privileges')
    if (privilegesString) {
      const privileges: string[] = privilegesString ? JSON.parse(privilegesString) : []
      return privileges
    }
    return []
  }

  // Fetch and format privileges
  useEffect(() => {
    const fetchPrivileges = async () => {
      try {
        setLoader(true)
        const response = await api.post('/privileges/all', {
          isCorporate: true,
        })

        const selectedPrivileges = fetchingParams()
        const customPrivileges = response.data.map((privilege: Privilege) => ({
          ...privilege,
          label: privilege.name,
          selected: selectedPrivileges.includes(privilege.id),
        }))

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
            acc.push({
              ...privilege,
              value: privilege.id,
            })
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
    let selectedPrivilegesOptions = selectedPrivilegesSet.map((option: Privilege) => option)

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

  // Save updated role
  const saveRole = async () => {
    const form = document.querySelector('form')
    if (!form!.checkValidity()) {
      setValidated(true)
      return
    }

    setLoader(true)
    try {
      const privileges = handlePrivilegesChange()
      const dashBoardPriv = privilegesOptions.find((privilege) => privilege.code === 'CORPDASH')
      console.log('privileges found: ', dashBoardPriv)

      const updatedRoleData = {
        ...roleData,
        privileges: privileges.length != 0 ? privileges : dashBoardPriv ? [dashBoardPriv] : [], //find CorpDash, if not send empty list
      }

      const response = await api.post('role/update', updatedRoleData)
      if (response.data.status === '0003') {
        showToast('error', 'Role already exists!')
      } else if (response.data.status === '0000') {
        showToast('success', 'Role edited successfully!', {
          onClose: () => {
            router.replace('/roles/list')
          },
        })
      } else {
        throw new Error(response.data)
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
              <h2 className="formTitle">Edit Role</h2>
              <p className="formDescription">Role Details</p>
            </CCardBody>
          </CCard>
        </CCol>

        <CCol xs={8}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <CRow className="p-2">
                <CCol xs={4}></CCol>
                <CCol xs={4}></CCol>
                <CCol className="text-end" xs={4}>
                  {/* <Link href="/roles/list" passHref>
                    <CButton color="primary" variant="outline" size="sm">
                      <CIcon icon={cilList} size="sm" /> Role List
                    </CButton>
                  </Link> */}
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
                          disabled
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
                    {/* <div className="mb-3 role-list">
                      <CFormLabel htmlFor="privilegesOptions">Privileges</CFormLabel>
                      <CMultiSelect
                        id="privilegesOptions"
                        optionsMaxHeight={350}
                        options={privilegesOptions}
                        onChange={(selected) => setSelectedPrivilegesSet(selected as Privilege[])}
                        className={
                          validated && !selectedPrivilegesSet.length
                            ? 'is-invalid privilegesOptions'
                            : 'privilegesOptions'
                        }
                      />
                      <CFormFeedback invalid>Please Select Privileges.</CFormFeedback>
                    </div> */}

                    <div className="mb-3 role-list">
                      <CFormLabel htmlFor="privilegesOptions">Privileges</CFormLabel>
                      <CMultiSelect
                        id="privilegesOptions"
                        optionsMaxHeight={350}
                        options={privilegesOptions}
                        onChange={(selected) => {
                          setSelectedPrivilegesSet(selected as Privilege[])
                          setValidated(true) // Set validation state
                        }}
                        className={
                          validated && !selectedPrivilegesSet.length
                            ? 'is-invalid privilegesOptions'
                            : 'privilegesOptions'
                        }
                      />
                      <div className="selected-items mt-2">
                        {selectedPrivilegesSet.length > 0 ? (
                          <span>{selectedPrivilegesSet.length} item(s) selected</span>
                        ) : (
                          selectedPrivilegesSet.map((item, index) => (
                            <span key={index} className="badge bg-primary me-1">
                              {item.label}{' '}
                              <button
                                type="button"
                                className="btn-close btn-close-white ms-1"
                                aria-label="Remove"
                                onClick={() =>
                                  setSelectedPrivilegesSet((prev) =>
                                    prev.filter((selected) => selected.value !== item.value),
                                  )
                                }
                              ></button>
                            </span>
                          ))
                        )}
                      </div>
                      <CFormFeedback invalid>Please Select Privileges.</CFormFeedback>
                    </div>
                  </CCol>
                </CRow>

                <CRow className="text-end">
                  <CCol xs={12}>
                    <Link href="/roles/list" passHref>
                      <CButton color="danger" className="text-white me-1">
                        {cancel}
                      </CButton>
                    </Link>

                    <CButton
                      type="button"
                      color="primary btnCustom"
                      onClick={saveRole}
                      style={{ marginLeft: '7px' }}
                    >
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

export default EditRole
