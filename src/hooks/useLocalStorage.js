import { useEffect, useState } from 'react'

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const savedValue = localStorage.getItem(key)

      if (savedValue !== null) {
        return JSON.parse(savedValue)
      }

      return initialValue
    } catch (error) {
      console.error('Error loading localStorage:', error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }, [key, value])

  return [value, setValue]
}

export default useLocalStorage
