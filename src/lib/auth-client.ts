import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  // Use relative URL so it works on any port
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
})

export const { signIn, signUp, signOut, useSession } = authClient
