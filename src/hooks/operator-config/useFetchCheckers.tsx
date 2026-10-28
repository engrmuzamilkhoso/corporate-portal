import api from '@/utils/axios'
import { useEffect } from 'react'

export const useFetchCheckers = (
  userId: string,
  setCheckerList: (checkerList: { label: string; value: string }[]) => void,
  setLoader: (v: boolean) => void,
) => {

  useEffect(() => {
    setLoader(true)

      api.post('corporate/makerCheckerRole/checkerByScreen?pageCode=OPC')
      .then((checkerResponse) => {
        if (checkerResponse.status === 200) {
          const pageData = checkerResponse.data
          const checkerListData = (pageData as any[])
            .filter((checker) => checker.userDetail.userID !== userId)
            .map((page) => ({
              label: page.userDetail.firstName + ' ' + page.userDetail.lastName,
              value: page.id,
            }))
          setCheckerList(checkerListData)
        }
      })
      .catch((error) => {
        console.error('Error fetching checker list', error)
      })
      .finally(() => {
        setLoader(false)
      })
  }, [])
}
