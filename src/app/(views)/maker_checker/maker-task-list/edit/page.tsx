'use client'

import Loader from '@/components/loader'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import MDRUpdateComponent from './MDRUpdate'
import FeeTemplateUpdate from './Maker_Component'
import OperatorConfigUpdate from './OperatorConfigUpdate'
import { NavigationItem, selectPrivileges, useTypedSelector } from '@/store'

const FeeManagementUpdate = () => {
  const [taskData, setTaskData] = useState({ id: '', type: 'TEMPLATECREATE' })
  const [loading, setLoading] = useState(false)
  const [makerCheckerStatus, setMakerCheckerStatus] = useState(false)
  const searchParams = useSearchParams()
  const location = usePathname()
  const flatNavItems: NavigationItem[] = useTypedSelector(selectPrivileges)

  useEffect(() => {
    setLoading(true)
  
    const currentPage = flatNavItems.find(
      (item) => location === item.path && item.subMenuKey?.length !== 0,
    )
    setMakerCheckerStatus((currentPage as any)?.makerCheckerEnabled ?? false)

    const id = searchParams.get('id') || ''
    const type = searchParams.get('type') || 'TEMPLATECREATE'
    setTaskData({ id: id, type: type })
    setLoading(false)
    console.log(type)
  }, [])
  // @ts-ignore
  if (loading) {
    return <Loader isLoading={loading} />
  }
  
  {/* {taskData.type === 'MDRCREATE' ? <MDRUpdateComponent /> : <FeeTemplateUpdate />} */}
  switch (taskData.type) {
    case 'MDRCREATE':
      return <MDRUpdateComponent />
    case 'TEMPLATECREATE':
      return <FeeTemplateUpdate />
    case 'OPC':
      return <OperatorConfigUpdate />
    default:
      return
  }
}

export default FeeManagementUpdate
