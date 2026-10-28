'use client'

import AccessDeniedComponent from '@/components/AccessDeniedComponent'
import DisabledComponent from '@/components/DisabledComponent'
import Loader from '@/components/loader'
import { selectPrivileges, NavigationItem, selectUserAuth, useTypedSelector } from '@/store'
import api from '@/utils/axios'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import MdrFormComponent from './Mdr_Component'

const CheckerComponent = () => <div>Checker Role Content</div>
const FeeManagement = () => {
  const [roleData, setRoleData] = useState<{ role?: string; disabled?: boolean }>({})
  const [loading, setLoading] = useState(true)
  const [makerCheckerStatus, setMakerCheckerStatus] = useState(true)
  const userAuth = useTypedSelector(selectUserAuth)
  const flatNavItems: NavigationItem[] = useTypedSelector(selectPrivileges)

  const location = usePathname()
  useEffect(() => {
    setLoading(true)

    const currentPage = flatNavItems.find(
      (item) => location === item.path && item.subMenuKey?.length !== 0,
    )
    setMakerCheckerStatus((currentPage as any)?.makerCheckerEnabled ?? false)

    api.post('corporate/makerCheckerRole/list-access', {
      pageCode: 'MDRCREATE',
      role: 'Maker',
    })
      .then((rightsResponse) => {
        // Handle the response for 'corporate/makerCheckerRole/list'
        const canAccess = rightsResponse.data.access
        if (!canAccess) {
          setRoleData({ role: 'null' })
        } else {
          setRoleData({ role: 'maker' })
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [userAuth.email, location])

  if (loading) {
    return <Loader isLoading={true} />
  }

  if (roleData.disabled) {
    return <DisabledComponent />
  }
  switch (roleData.role) {
    case 'maker':
      return <MdrFormComponent makerCheckerEnabledStatus={makerCheckerStatus} />
    case 'null':
      return <AccessDeniedComponent role="Maker" />
    default:
      return <div>No valid role found</div>
  }
}

export default FeeManagement
