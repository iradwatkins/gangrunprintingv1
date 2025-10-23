'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name?: string | null
  phoneNumber?: string | null
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user/me')
        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [])

  return { user, loading }
}
