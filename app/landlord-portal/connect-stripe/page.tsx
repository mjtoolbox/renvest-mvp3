"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ConnectStripePage() {
  const router = useRouter()
  const params = useSearchParams()
  const initialEmail = params?.get('email') || ''
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect(e?: React.MouseEvent) {
    e?.preventDefault()
    if (!email) return setError('Please provide your email')
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/mock-stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const json = await res.json()
      setLoading(false)
      if (!res.ok) return setError(json?.error || 'Failed to connect')
      // Success — redirect back to landlord portal where stripeAccountId will now be present
      router.push(`/landlord-portal?email=${encodeURIComponent(email)}`)
    } catch (err) {
      setLoading(false)
      setError('Network or server error')
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold">Connect Stripe (Mock)</h1>
        <p className="mt-4 text-gray-600">This simulates Stripe's Connect flow for testing. The app will create a mock connected account and attach it to your user.</p>

        <div className="mt-6 text-left">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="mt-1 block w-full rounded border px-3 py-2" />
        </div>

        <div className="mt-6">
          <button onClick={handleConnect} disabled={loading} className="rounded bg-btnblue px-4 py-2 text-white">
            {loading ? 'Connecting…' : 'Simulate Connect'}
          </button>
        </div>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

      </div>
    </div>
  )
}
