'use server'

import { db, user } from '@/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function updateProfile(formData: FormData) {
    const session = await requireAuth()
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Email is required' }
    }

    try {
        await db.update(user)
            .set({
                name,
                email,
                updatedAt: new Date(),
            })
            .where(eq(user.id, session.user.id))

        revalidatePath('/settings')
        revalidatePath('/dashboard')
        return { success: 'Profile updated successfully' }
    } catch (error: any) {
        return { error: error.message || 'Failed to update profile' }
    }
}

export async function changePassword(formData: FormData) {
    const session = await requireAuth()
    
    const currentPassword = formData.get('currentPassword') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || !confirmPassword) {
        return { error: 'All fields are required' }
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    if (password.length < 8) {
        return { error: 'Password must be at least 8 characters' }
    }

    try {
        // Use Better Auth's change password API
        await auth.api.changePassword({
            headers: await headers(),
            body: {
                currentPassword,
                newPassword: password,
            },
        })

        return { success: 'Password changed successfully' }
    } catch (error: any) {
        console.error('Change password error:', error)
        return { error: error.message || 'Failed to change password' }
    }
}
