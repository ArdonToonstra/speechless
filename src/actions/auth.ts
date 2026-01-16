'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

/**
 * Get the current session from the server
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}

/**
 * Get current user from session
 * Used to check authentication status
 */
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

/**
 * Check if user is authenticated, redirect to login if not
 */
export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

/**
 * Login with email and password
 */
export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Missing email or password' }
  }

  try {
    const result = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    })

    if ('error' in result && result.error) {
      return { error: 'Invalid email or password' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Login error:', error)
    return { error: 'Invalid email or password' }
  }
}

/**
 * Sign up with email and password
 */
export async function signup(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!name || !email || !password || !confirmPassword) {
    return { error: 'All fields are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters' }
  }

  try {
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    })

    if ('error' in result && result.error) {
      return { error: 'Failed to create account' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Signup error:', error)
    if (error.message?.includes('unique') || error.message?.includes('already')) {
      return { error: 'Email already exists' }
    }
    return { error: error.message || 'Failed to create account' }
  }
}

/**
 * Logout and redirect to home
 */
export async function logout() {
  await auth.api.signOut({
    headers: await headers(),
  })
  redirect('/')
}
