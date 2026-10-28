'use client'

import Loader from '@/components/loader'
import ToastNotification from '@/components/ToastNotification'
import useToastNotification from '@/hooks/toastNotification'
import { api } from '@/utils/axios'
import { save } from '@/utils/crudBtnTexts'
import { cilPlus, cilTrash, cilWarning } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormFeedback,
  CFormLabel,
  CFormSelect,
  CRow,
  CFormText,
  CContainer,
} from '@coreui/react-pro'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const roleList = [
  { label: 'Maker', value: 'Maker' },
  { label: 'Checker', value: 'Checker' },
]

const RoleAssign = () => {
  const { showToast } = useToastNotification()
  const [groups, setGroups] = useState([
    { userId: '', pageCode: '', role: '', status: true, isValid: false },
  ])
  const [userOptions, setUserOptions] = useState<any[]>([])
  const [userPageMap, setUserPageMap] = useState<{ [userId: string]: any[] }>({})
  const [loader, setLoader] = useState(false)
  const [validated, setValidated] = useState(false)
  const [apiErrors, setApiErrors] = useState([]) // Add state to hold the API error response
  const router = useRouter()

  const setUsers = (userList: any) => {
    setUserOptions(
      userList.map((user: any) => ({
        label: user.firstName + ' ' + user.lastName,
        value: user.id,
      })),
    )
  }

  const fetchPagesByUserId = async (userId: string) => {
    if (!userPageMap[userId]) {
      setLoader(true)
      try {
        const pagesResponse = await api.post(
          `/corporate/makerCheckerRole/privilegesByUserId?userId=${userId}`,
        )
        if (pagesResponse.status === 200) {
          const pages = pagesResponse.data.map((page: any) => ({
            label: page.alias ? page.alias : page.title,
            value: page.code,
          }))
          setUserPageMap((prevMap) => ({
            ...prevMap,
            [userId]: pages,
          }))
        }
      } catch (error) {
        showToast('error', 'Failed to load pages')
      } finally {
        setLoader(false)
      }
    }
  }

  useEffect(() => {
    const fetchUserOptions = async () => {
      setLoader(true)
      try {
        const usersResponse = await api.post('/user/v2/all', { limit: 40, isCorporate: true })
        if (usersResponse.status === 200) {
          const filteredUsers = usersResponse.data.content.filter(
            (user: any) =>
              user.enabled &&
              user.roles &&
              user.roles.some((role: any) => role.privileges && role.privileges.length > 0),
          )

          setUsers(filteredUsers)
        }
      } catch (error) {
        console.error(error)
        showToast('error', 'Failed to load users')
      } finally {
        setLoader(false)
      }
    }

    fetchUserOptions()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle adding a new group
  const addGroup = () => {
    setGroups([...groups, { userId: '', pageCode: '', role: '', status: true, isValid: false }])
  }

  // Handle input change
  const handleGroupChange = (index: number, field: string, value: any) => {
    const updatedGroups = [...groups]
    updatedGroups[index] = { ...updatedGroups[index], [field]: value }

    // Fetch pages when user is selected
    if (field === 'userId') {
      fetchPagesByUserId(value)
    }

    // Validate group on each change
    updatedGroups[index].isValid = validateGroup(updatedGroups[index])
    setGroups(updatedGroups)
  }

  // Validate group before submission
  const validateGroup = (group: any) => {
    return group.userId !== '' && group.pageCode !== '' && group.role !== ''
  }

  // Save form data and capture errors
  const saveAssignment = async () => {
    const updatedGroups = groups.map((group) => ({
      ...group,
      isValid: validateGroup(group),
    }))

    setGroups(updatedGroups)
    const isFormValid = updatedGroups.every((group) => group.isValid)

    if (!isFormValid) {
      setValidated(true)
      showToast('error', 'Please fill all required fields')
      return
    }

    setLoader(true)
    try {
      const response = await api.post('/corporate/makerCheckerRole/save', { roles: groups })
      if (response.status == 200) {
        const data = response.data

        if (data.notSavedRole && data.notSavedRole.length > 0) {
          const newErrorEntries: typeof groups = data.notSavedRole.map((role: any) => ({
            isValid: role.isValid,
            userId: role.userId,
            pageCode: role.pageCode,
            role: role.role,
            status: role.status,
          }))
          console.log(newErrorEntries)
          setGroups(newErrorEntries)

          setApiErrors(data.notSavedRole)
          showToast('warn', 'Some Roles Already exists')
          return
        }
        if (data.status !== '0000') {
          showToast('error', (data.message as string).replace(/-/g, ' '))
        } else {
          showToast('success', 'Role assigned successfully!')
          setTimeout(() => {
            router.push('/maker_checker/list')
          }, 1000)
        }
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      showToast('error', 'Error assigning roles')
    } finally {
      setLoader(false)
    }
  }

  // Handle deleting a group
  const deleteGroup = (index: number) => {
    const updatedGroups = groups.filter((_, groupIndex) => groupIndex !== index)
    setGroups(updatedGroups)
  }

  // Function to get error message for a specific group
  const getErrorForGroup = (group: any) => {
    const error: any = apiErrors.find(
      (err: any) =>
        err.userId === group.userId && err.pageCode === group.pageCode && err.role === group.role,
    )
    return error ? error.reason : null
  }

  const getSelectedPagesForUser = (userId: string, currentGroupIndex: number) => {
    return groups
      .filter((group, index) => group.userId === userId && index !== currentGroupIndex)
      .map((group) => group.pageCode)
  }

  return (
    <CContainer md className="px-4">
      <CRow>
        <Loader isLoading={loader} />
        <CCol xl={3}>
          <CCard style={{ border: 'none' }}>
            <CCardBody>
              <h2 className="formTitle">Assign Page</h2>
              <p className="formDescription">Assignment Details</p>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={9}>
          <CCard className="mb-4" style={{ border: 'none' }}>
            <CCardBody>
              <CForm noValidate className={validated ? 'was-validated' : ''}>
                <CRow>
                  <CCol lg={4}>
                    <CFormLabel htmlFor={`user`}>User</CFormLabel>
                  </CCol>
                  <CCol lg={4}>
                    <CFormLabel htmlFor={`user`}>Page</CFormLabel>
                  </CCol>
                  <CCol lg={3}>
                    <CFormLabel htmlFor={`user`}>Role</CFormLabel>
                  </CCol>
                </CRow>
                {groups.map((group, index) => (
                  <div key={index} className="mb-3">
                    {index > 0 && <hr className="my-4" />}
                    <CRow>
                      <CCol lg={4}>
                        <CFormSelect
                          id={`user-${index}`}
                          value={group.userId}
                          onChange={(e) => handleGroupChange(index, 'userId', e.target.value)}
                          required
                          className={validated && !group.userId ? 'is-invalid' : ''}
                        >
                          <option value="">Select User</option>
                          {userOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      <CCol lg={3}>
                        <CFormSelect
                          id={`page-${index}`}
                          value={group.pageCode}
                          onChange={(e) => handleGroupChange(index, 'pageCode', e.target.value)}
                          required
                          className={validated && !group.pageCode ? 'is-invalid' : ''}
                        >
                          <option value="">Select Page</option>
                          {(userPageMap[group.userId] || [])
                            .filter(
                              (option) =>
                                !getSelectedPagesForUser(group.userId, index).includes(
                                  option.value,
                                ),
                            )
                            .map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                        </CFormSelect>
                      </CCol>

                      <CCol lg={3}>
                        <CFormSelect
                          id={`role-${index}`}
                          value={group.role}
                          onChange={(e) => handleGroupChange(index, 'role', e.target.value)}
                          required
                          className={validated && !group.role ? 'is-invalid' : ''}
                        >
                          <option value="">Select Role</option>
                          {roleList.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      {index !== groups.length - 1 ? (
                        <CCol lg={1} className="align-items-center">
                          <CButton
                            color="danger"
                            variant="outline"
                            onClick={() => deleteGroup(index)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CCol>
                        ) : (
                          <>
                            <CCol lg={1} className="align-items-center">
                              <CButton color="secondary" variant="outline" onClick={addGroup}>
                                <CIcon icon={cilPlus} />
                              </CButton>
                            </CCol>
                            {index !== 0 && (
                                <CCol lg={1} className="align-items-center">
                                  <CButton
                                    color="danger"
                                    variant="outline"
                                    onClick={() => deleteGroup(index)}
                                  >
                                    <CIcon icon={cilTrash} />
                                  </CButton>
                                </CCol>
                            )}
                          </>
                        )}
                    </CRow>

                    {getErrorForGroup(group) && (
                      <CFormText className="text-danger mt-2">
                        <CIcon icon={cilWarning} className="flex-shrink-0 me-2" />
                        {(getErrorForGroup(group) as string).replace(/-/g, ' ')}
                      </CFormText>
                    )}
                  </div>
                ))}
                <div className="text-end mt-3">
                  <CButton
                    type="button"
                    color="primary btnCustom"
                    onClick={saveAssignment}
                    style={{ marginLeft: '7px' }}
                  >
                    {save}
                    <i className="bi bi-arrow-right" style={{ marginLeft: '7px' }}></i>
                  </CButton>
                </div>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      <ToastNotification />
    </CContainer>
  )
}

export default RoleAssign
