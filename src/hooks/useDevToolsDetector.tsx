import api from '@/utils/axios'
import { useEffect, useRef, useState } from 'react'

export function useDevToolsAuth(logoutFn: () => void) {
  const [devToolsAllowed, setDevToolsAllowed] = useState(false)
  const isCheckingRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const detectDevToolsViaProfile = () => {
      const start = performance.now()
      console.profile?.()
      console.profileEnd?.()
      return performance.now() - start > 20
    }

    const checkDevTools = async () => {
      if (devToolsAllowed || isCheckingRef.current) return

      if (detectDevToolsViaProfile()) {
        isCheckingRef.current = true // ⏸ Pause new checks while pending

        const code = prompt('DevTools access is restricted. Enter developer code:')
        if (code) {
          try {
            const response = await api.post('/access-control/validate-code', {
              validationCode: code,
            })

            if (response.status === 200 && response.data?.status === '0000') {
              setDevToolsAllowed(true)
              alert('✅ DevTools access granted.')
            } else {
              await showAlertAndLogout('❌ Wrong passcode. Redirecting...', logoutFn)
            }
          } catch (err) {
            console.error('Authorization check failed:', err)
            await showAlertAndLogout('❌ Authorization failed. Redirecting...', logoutFn)
          }
        } else {
          await showAlertAndLogout('⚠️ DevTools access denied. Redirecting...', logoutFn)
        }

        isCheckingRef.current = false // ✅ Resume after handling
      }
    }

    // ⏱ Start interval
    intervalRef.current = setInterval(checkDevTools, 1000)

    return () => {
      // 🧹 Clear interval on unmount
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [devToolsAllowed, logoutFn])

  return devToolsAllowed
}

const showAlertAndLogout = async (message: string, logoutFn: () => void) => {
  alert(message)
  await new Promise((res) => setTimeout(res, 500)) // Wait 0.5s after alert
  logoutFn()
}
