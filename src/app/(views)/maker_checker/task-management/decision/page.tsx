'use client'
import Loader from '@/components/loader'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import MDRComponent from './MDR'
import FeeTemplateComponent from './Template'
import OperatorConfigDecision from './OperatorConfigDecision'

const MakerComponent = () => {
  const [taskData, setTaskData] = useState({ id: '', type: 'TEMPLATECREATE', disabled: false })
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  useEffect(() => {
    setLoading(true)
    const id = searchParams.get('id') || ''
    const type = searchParams.get('type') || 'TEMPLATECREATE'
    const disabled = searchParams.get('disabled') === 'true' || false
    setTaskData({ id: id, type: type, disabled: disabled })
    setLoading(false)
    console.log(type)
  }, [])

  // @ts-ignore
  {/* {taskData.type === 'MDRCREATE' ? (
    <MDRComponent isDecisionDisabled={taskData.disabled} />
  ) : (
    <FeeTemplateComponent isDecisionDisabled={taskData.disabled} />
  )} */}
  if (loading) {
    return <Loader isLoading={loading} />
  }
  
  {/* {taskData.type === 'MDRCREATE' ? <MDRUpdateComponent /> : <FeeTemplateUpdate />} */}
  switch (taskData.type) {
    case 'MDRCREATE':
      return <MDRComponent isDecisionDisabled={taskData.disabled} />
    case 'TEMPLATECREATE':
      return <FeeTemplateComponent isDecisionDisabled={taskData.disabled} />
    case 'OPC':
      return <OperatorConfigDecision isDecisionDisabled={taskData.disabled} />
    default:
      return
  }
}

export default MakerComponent
