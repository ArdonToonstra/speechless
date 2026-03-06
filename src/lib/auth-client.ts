import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  // Use relative URL so it works on any port
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  plugins: [emailOTPClient()],
})

export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  resetPassword,
} = authClient

// EmailOTP plugin methods
export const verifyEmail = authClient.emailOtp.verifyEmail
export const sendVerificationOtp = authClient.emailOtp.sendVerificationOtp
export const forgetPassword = async (data: { email: string; redirectTo?: string }) => {
  try {
    const response = await fetch('/api/auth/forget-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      return { error: { message: (err as { message?: string }).message || 'Failed to send reset email' }, data: null }
    }
    return { data: await response.json().catch(() => ({})), error: null }
  } catch {
    return { error: { message: 'An error occurred' }, data: null }
  }
}