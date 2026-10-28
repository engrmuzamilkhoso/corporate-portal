// components/RolePage.tsx

'use client'

import AccessDeniedComponent from '@/components/AccessDeniedComponent'
import DisabledComponent from '@/components/DisabledComponent'
import Loader from '@/components/loader'
import { NavigationItem, selectPrivileges, selectUserAuth, useTypedSelector } from '@/store'
import api from '@/utils/axios'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import MakerComponent from './Maker_Component'

const CheckerComponent = () => <div>Checker Role Content</div>
const FeeManagement = () => {
  const [roleData, setRoleData] = useState<{ role?: string; disabled?: boolean }>({})
  const [loading, setLoading] = useState(true)
  const [makerCheckerStatus, setMakerCheckerStatus] = useState(true)
  const userAuth = useTypedSelector(selectUserAuth)

  const flatNavItems: NavigationItem[] = useTypedSelector(selectPrivileges)
  const location = usePathname()

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)

      try {
        await fetchRoleData()
        fetchPrivileges()
      } catch (err) {
        console.error('Error during data initialization:', err)
      } finally {
        setLoading(false)
      }
    }

    const fetchRoleData = async () => {
      const response = await api.post('corporate/makerCheckerRole/list-access', {
        pageCode: 'TEMPLATECREATE',
        role: 'Maker',
      })
      const canAccess = response.data.access
      if (!canAccess) {
        setRoleData({ role: 'null' })
      } else {
        setRoleData({ role: 'maker' })
      }
    }

    const fetchPrivileges = () => {
      const currentPage = flatNavItems.find(
        (item) => location === item.path && item.subMenuKey?.length !== 0,
      )
      setMakerCheckerStatus((currentPage as any)?.makerCheckerEnabled ?? false)
    }

    initializeData()
  }, [userAuth.email, location])

  if (loading) {
    return <Loader isLoading={true} />
  }

  if (roleData.disabled) {
    return <DisabledComponent />
  }
  switch (roleData.role) {
    case 'maker':
      return <MakerComponent makerCheckerEnabledStatus={makerCheckerStatus} />
    case 'null':
      return <AccessDeniedComponent role="Maker" />
    default:
      return <div>No valid role found</div>
  }
}

export default FeeManagement
