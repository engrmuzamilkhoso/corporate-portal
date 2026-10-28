import api from '@/utils/axios'
import { ConfigData } from '@/utils/configurationUtils'
import { TaskStatus } from '@/utils/status.enum'
import { useEffect } from 'react'

export const fetchConfigData = async (
  id: string,
  setConfigData: (configData: ConfigData) => void,
  setLoader: (v: boolean) => void,
  setDisabled: (v: boolean) => void,
  setConfigStatusObject?: React.Dispatch<React.SetStateAction<{
    configStatus: 'activate' | 'deactivate' | 'delete' | 'hold' | null
    modalVisibility: boolean
    disableSubmit: boolean
  }>>
) => {
  if (!id) return

  setLoader(true)
  try {
    const configDataResponse = await api.post(
      'corporate/autoReconSettlement/operator-config/getOperatorConfigurationById',
      { id }
    )

    if (configDataResponse.status === 200 && configDataResponse.data.status === '0000') {
      const configApiData = configDataResponse.data.data

      setConfigData({
        ...configApiData,
        operator: Object.keys(configApiData.operator)[0], // name instead of ID
      })

      setDisabled(
        configApiData.makerCheckerStatus.toLocaleLowerCase() !== TaskStatus.Pending &&
        configApiData.makerCheckerStatus.toLocaleLowerCase() !== TaskStatus.Review
      )

      if (setConfigStatusObject) {
        setConfigStatusObject({
          configStatus: configApiData.operatorConfigurationStatus,
          modalVisibility: false,
          disableSubmit: true,
        })
      }
    }
  } catch (error) {
    console.error('Error fetching operator configuration data', error)
  } finally {
    setLoader(false)
  }
}

export const useFetchConfigData = (
  id: string,
  setConfigData: (configData: ConfigData) => void,
  setLoader: (v: boolean) => void,
  setDisabled: (v: boolean) => void,
  setConfigStatusObject?: React.Dispatch<React.SetStateAction<{
    configStatus: 'activate' | 'deactivate' | 'delete' | 'hold' | null
    modalVisibility: boolean
    disableSubmit: boolean
  }>>
) => {
  useEffect(() => {
    fetchConfigData(id, setConfigData, setLoader, setDisabled, setConfigStatusObject)
  }, [id])
}