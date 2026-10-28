'use client'

import Loader from '@/components/loader'
import { useState } from 'react'
import MDRUpdateComponent from './MDR_Component'

const MDRRateUpdate = () => {
  const [loading, setLoading] = useState(false)

  if (loading) {
    return <Loader isLoading={true} />
  }

  return <MDRUpdateComponent makerCheckerEnabledStatus={true} />
}

export default MDRRateUpdate
