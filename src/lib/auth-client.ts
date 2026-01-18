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
export const forgetPassword = authClient.forgetPassword.emailOtp