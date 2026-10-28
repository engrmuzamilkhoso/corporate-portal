import api from '@/utils/axios'
import { useEffect } from 'react'

export const useFetchMerchants = (
  region: string,
  setMerchants: (merchants: { value: string; label: string }[]) => void,
  setLoader: (v: boolean) => void,
) => {
  useEffect(() => {
    if (!region) return

    setLoader(true)

    api
      .get(`merchant/v2/getAllMerchants?region=${region}`)
      .then((merchantsResponse) => {
        if (merchantsResponse.status === 200) {
          const merchantList = merchantsResponse.data.map((merchant: any) => ({
            value: merchant.id,
            label: merchant.id + ' - ' + merchant.firstName + ' ' + merchant.lastName,
          }))

          setMerchants(merchantList)
        }
      })
      .catch((err) => {
        console.error('Error fetching merchants:', err)
      })
      .finally(() => {
        setLoader(false)
      })
  }, [region])
}
