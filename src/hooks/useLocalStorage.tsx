import { useState, useEffect } from 'react'

interface UseLocalStorageOptions {
  /**
   * Initial value to use if no value is stored
   */
  defaultValue?: any
  /**
   * Function to run when the value changes
   */
  onChange?: (newValue: any, oldValue: any) => void
}

export function useLocalStorage(key: string, options: UseLocalStorageOptions = {}) {
  const { defaultValue, onChange } = options

  // Initialize state with existing localStorage value or default
  const [storedValue, setStoredValue] = useState(() => {
    // Next.js: Check if we're on the client side
    if (typeof window === 'undefined') {
      return defaultValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return defaultValue
    }
  })

  // Return a wrapped version of useState's setter function
  const setValue = (value: any) => {
    try {
      // Allow value to be a function
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to localStorage
      if (typeof window !== 'undefined') {
        const oldValue = JSON.parse(window.localStorage.getItem(key) || 'null')
        window.localStorage.setItem(key, JSON.stringify(valueToStore))

        // Trigger onChange callback if provided
        if (onChange) {
          onChange(valueToStore, oldValue)
        }

        // Dispatch custom event for cross-tab communication
        window.dispatchEvent(
          new CustomEvent('local-storage', {
            detail: { key, value: valueToStore, oldValue },
          }),
        )
      }
    } catch (error) {
      console.warn(`Error saving to localStorage key "${key}":`, error)
    }
  }

  useEffect(() => {
    // Handler for storage events (from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        console.log('From Other Tab: ', e)
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : null
          setStoredValue(newValue)
          if (onChange) {
            onChange(newValue, e.oldValue ? JSON.parse(e.oldValue) : null)
          }
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error)
        }
      }
    }

    // Handler for custom events (from current tab)
    const handleCustomEvent = (e: CustomEvent) => {
      if (e.detail.key === key) {
        console.log('From Current Tab: ', e)

        setStoredValue(e.detail.value)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('local-storage', handleCustomEvent as EventListener)
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('local-storage', handleCustomEvent as EventListener)
      }
    }
  }, [key, onChange])

  return [storedValue, setValue] as const
}
