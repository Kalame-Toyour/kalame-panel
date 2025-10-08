'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'

export default function JWTExpirationTest() {
  const { data: session } = useSession()
  const [testResult, setTestResult] = useState<string>('')

  const testJWTExpiration = () => {
    if (!session?.user) {
      setTestResult('No session found')
      return
    }

    const user = session.user as any
    const now = Date.now()
    const expiresAt = user.expiresAt

    if (!expiresAt) {
      setTestResult('No expiration time found')
      return
    }

    const timeLeft = expiresAt - now
    const isExpired = timeLeft <= 0

    setTestResult(`
      User: ${user.name}
      Access Token: ${user.accessToken ? 'Present' : 'Missing'}
      Refresh Token: ${user.refreshToken ? 'Present' : 'Missing'}
      Expires At: ${new Date(expiresAt).toISOString()}
      Time Left: ${Math.round(timeLeft / 1000)} seconds
      Is Expired: ${isExpired}
      Has Error: ${user.error || 'None'}
    `)
  }

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="font-bold mb-2">JWT Expiration Test</h3>
      <button
        onClick={testJWTExpiration}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm mb-2"
      >
        Test JWT Status
      </button>
      {testResult && (
        <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto max-h-32">
          {testResult}
        </pre>
      )}
    </div>
  )
}
