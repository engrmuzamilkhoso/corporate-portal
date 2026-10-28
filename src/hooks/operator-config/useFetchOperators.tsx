import api from '@/utils/axios'
import { ConfigData, Operator, operatorMapping } from '@/utils/configurationUtils'
import { formatDataList } from '@/utils/formatDataList'
import { useEffect } from 'react'

export const useFetchOperators = (
  account_route: string,
  region: string,
  channel: string,
  operator: string,
  setOperators: (operators: Operator[]) => void,
  setLoader: (v: boolean) => void,
) => {
  useEffect(() => {
    console.log('fetch ops')
    let operatorsApi = ''
    if (account_route && region && channel) {
      if (channel === 'Collection') {
        operatorsApi = `/operator/getAllOperatorsTransaction?region=${region}`
      } else if (channel === 'Disbursement') {
        operatorsApi = `/operator/getAllOperator?db=DISB`
      } else if (channel === 'Remittance') {
        operatorsApi = `/operator/getAllOperator?db=REMITTANCE`
      }
    }

    if (operatorsApi) {
      setLoader(true)
      api
        .get(operatorsApi)
        .then((response) => {
          if (response.status === 200) {
            const data = response?.data
            const items = Array.isArray(data) ? data : data?.content || []
            const formatted = formatDataList(items)
            const options: Operator[] = [
              ...formatted?.map((it: any) => ({
                value: String(it.id),
                label: it.name,
                selected: String(it.id) === operator,
              })),
            ]
            setOperators(options)
          }
        })
        .catch((error) => {
          console.error('Error fetching Operators:', error)
        })
        .finally(() => {
          setLoader(false)
        })
    }
  }, [account_route, channel, region])
}
