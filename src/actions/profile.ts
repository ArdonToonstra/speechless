'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Email is required' }
    }

    const payload = await getPayload({ config: configPromise })
    const headersList = await headers()
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        await payload.update({
            collection: 'users',
            id: user.id,
            data: {
                name,
                email,
            } as any,
        })

        revalidatePath('/settings')
        revalidatePath('/dashboard')
        return { success: 'Profile updated successfully' }
    } catch (error: any) {
        return { error: error.message || 'Failed to update profile' }
    }
}

export async function changePassword(formData: FormData) {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || !confirmPassword) {
        return { error: 'All fields are required' }
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' }
    }

    const payload = await getPayload({ config: configPromise })
    const headersList = await headers()
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        await payload.update({
            collection: 'users',
            id: user.id,
            data: {
                password,
            },
        })

        return { success: 'Password changed successfully' }
    } catch (error: any) {
        return { error: error.message || 'Failed to change password' }
    }
}
