'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Missing email or password' }
    }

    const payload = await getPayload({ config: configPromise })

    try {
        const result = await payload.login({
            collection: 'users',
            data: {
                email,
                password,
            },
        })

        if (result.token) {
            const cookieStore = await cookies()
            cookieStore.set('payload-token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                // Calculate expiration based on Payload config (usually 2h or 2w), defaulting to 7 days for now
                maxAge: 60 * 60 * 24 * 7,
            })

            return { success: true }
        } else {
            return { error: 'Invalid credentials' }
        }

    } catch (error) {
        return { error: 'Invalid email or password' }
    }
}

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

    const payload = await getPayload({ config: configPromise })

    try {
        // Build an explicit user object for creation
        // If 'name' is in the schema, we'd add it here.
        // Checking Users.ts, only email is default. Assuming just email/password for now.

        await payload.create({
            collection: 'users',
            data: {
                name,
                email,
                password,
            } as any
        })

        // Auto-login after creation
        return login(formData)

    } catch (error: any) {
        console.error("Signup error:", error)
        // Check for duplicate email error usually thrown by MongoDB/Postgres via Payload
        if (error.message?.includes('unique')) {
            return { error: 'Email already exists' }
        }
        return { error: error.message || 'Failed to create account' }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')
    redirect('/')
}
