'use client'

import Loader from '@/components/loader'
import { useState } from 'react'
import MDRStatusUpdateComponent from './MDR_Status_Update_Component'

const MDRRateUpdate = () => {
  const [loading, setLoading] = useState(false)

  if (loading) {
    return <Loader isLoading={true} />
  }

  return <MDRStatusUpdateComponent makerCheckerEnabledStatus={true} />
}

export default MDRRateUpdate
