import api from '@/utils/axios'
import {
  ConfigData,
  ConfigurationDropdownOption,
  operatorMapping,
} from '@/utils/configurationUtils'
import { useEffect } from 'react'

export const useFetchOperatorMerchants = (
  configData: ConfigData,
  setOperatorMerchantIDs: (operatorMerchantIDs: ConfigurationDropdownOption[]) => void,
  setLoader: (v: boolean) => void,
) => {
  useEffect(() => {
      if (configData.account_route && configData.region && configData.operator) {
        setLoader(true)
        const typeIds = '1,2,3' // hard coded values that are being used temporarily
        api
          .get(
            `merchant/v2/getAllMerchants?accountRoute=${configData.account_route}&region=${configData.region}&typeIds=${typeIds}`,
          )
          // above API works for SP and Pakistan only. Should also include a operator ID parameter
          .then((response) => {
            if (response.status === 200) {
              operatorMapping(response, setOperatorMerchantIDs, configData)
            }
          })
          .catch((error) => {
            console.error('Error fetching Merchant Operator IDs:', error)
          })
          .finally(() => {
            setLoader(false)
          })
      }
  }, [configData.operator])
}
