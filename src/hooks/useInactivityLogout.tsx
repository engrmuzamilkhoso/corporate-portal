import { useEffect, useRef, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'


const useInactivityLogout = (logout: () => void) => {
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null)
  
  const [authData] = useLocalStorage("authToken");
  
  const INACTIVITY_TIME = (authData?.sessionTime ?? 15) * 60 * 1000;
  
  // Function to reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    
    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current)
    }

    inactivityTimeout.current = setTimeout(() => {
      logout() // Call external logout function
    }, INACTIVITY_TIME)
  }, [logout])

  // Monitor user activity
  useEffect(() => {
    const activityHandler = () => resetInactivityTimer()

    document.addEventListener('mousemove', activityHandler)
    document.addEventListener('click', activityHandler)

    // Start the inactivity timer
    resetInactivityTimer()

    return () => {
      if (inactivityTimeout.current) {
        clearTimeout(inactivityTimeout.current)
      }
      document.removeEventListener('mousemove', activityHandler)
      document.removeEventListener('click', activityHandler)
    }
  }, [resetInactivityTimer])

  return null
}

export default useInactivityLogout
