'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyEmail, sendVerificationOtp } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [fetchingCode, setFetchingCode] = useState(false)
  const isDev = process.env.NODE_ENV !== 'production'

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // For emailOTP verification, we need email and otp
      const result = await verifyEmail({
        email: email || '',
        otp: code,
      })

      if (result.error) {
        setError(result.error.message || 'Verification failed')
      } else {
        // Auto sign-in is configured, so just redirect
        router.push('/dashboard')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    setError(null)

    try {
      const result = await sendVerificationOtp({
        email: email || '',
        type: 'email-verification',
      })

      if (result.error) {
        setError(result.error.message || 'Failed to resend code')
      } else {
        setResendSuccess(true)
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleGetCode = async () => {
    setFetchingCode(true)
    setError(null)

    try {
      const response = await fetch(`/api/auth/test-code?email=${encodeURIComponent(email || '')}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to fetch code')
      } else if (data.isExpired) {
        setError('Code has expired. Please resend a new code.')
      } else {
        setCode(data.code)
      }
    } catch (err) {
      setError('Failed to fetch code. Please try again.')
    } finally {
      setFetchingCode(false)
    }
  }

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invalid Request</CardTitle>
            <CardDescription>No email address provided</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We sent a 6-digit code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {resendSuccess && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
                Code resent successfully!
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || code.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>

            {isDev && (
              <Button
                type="button"
                onClick={handleGetCode}
                disabled={fetchingCode}
                variant="outline"
                className="w-full"
              >
                {fetchingCode ? 'Fetching...' : '🔧 Get Code (Dev Only)'}
              </Button>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : "Didn't receive the code? Resend"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}