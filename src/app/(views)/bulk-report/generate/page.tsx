'use client'

import AccessDeniedComponent from '@/components/AccessDeniedComponent'
import DisabledComponent from '@/components/DisabledComponent'
import Loader from '@/components/loader'
import { selectUserAuth, useTypedSelector } from '@/store'
import api from '@/utils/axios'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import BulkReportGenerateComponent from './BulkReportGeneratecomponent'

const BulkReportGenerate = () => {
  const [loading, setLoading] = useState(false)
  const userAuth = useTypedSelector(selectUserAuth)

  const location = usePathname()

  if (loading) {
    return <Loader isLoading={true} />
  }

  return <BulkReportGenerateComponent />
}

export default BulkReportGenerate
