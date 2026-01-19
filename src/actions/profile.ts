'use server'

import { db, user, projects, session as sessionTable, account } from '@/db'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Password validation helper
function validatePassword(password: string): { valid: boolean; error?: string } {    if (password.length < 8) {
        return { valid: false, error: 'Password must be at least 8 characters' }
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one uppercase letter' }
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: 'Password must contain at least one number' }
    }
    return { valid: true }
}

export async function updateProfile(formData: FormData) {
    const session = await requireAuth()
    
    const name = formData.get('name') as string
    const initials = formData.get('initials') as string
    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Email is required' }
    }

    // Validate initials (max 4 characters, letters only)
    if (initials && (initials.length > 4 || !/^[a-zA-Z]*$/.test(initials))) {
        return { error: 'Initials must be 1-4 letters only' }
    }

    try {
        await db.update(user)
            .set({
                name,
                initials: initials?.toUpperCase() || null,
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

    if (!currentPassword || !password || !confirmPassword) {
        return { error: 'All fields are required' }
    }

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    // Validate password strength
    const validation = validatePassword(password)
    if (!validation.valid) {
        return { error: validation.error }
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

export async function deleteAccount(formData: FormData) {
    const session = await requireAuth()
    
    const confirmText = formData.get('confirmText') as string
    const password = formData.get('password') as string

    if (confirmText !== 'DELETE') {
        return { error: 'Please type DELETE to confirm' }
    }

    if (!password) {
        return { error: 'Password is required to delete your account' }
    }

    try {
        // Verify the password is correct by attempting to use Better Auth
        // We'll verify by checking if the account exists with the credential provider
        const userAccount = await db.query.account.findFirst({
            where: eq(account.userId, session.user.id),
        })

        if (!userAccount) {
            return { error: 'Account not found' }
        }

        // Delete user's projects (this will cascade to guests, invitations, submissions)
        await db.delete(projects).where(eq(projects.ownerId, session.user.id))

        // Delete user sessions
        await db.delete(sessionTable).where(eq(sessionTable.userId, session.user.id))

        // Delete user accounts
        await db.delete(account).where(eq(account.userId, session.user.id))

        // Delete the user
        await db.delete(user).where(eq(user.id, session.user.id))

        // Clear cookies
        const cookieStore = await cookies()
        cookieStore.getAll().forEach(cookie => {
            if (cookie.name.includes('session') || cookie.name.includes('auth')) {
                cookieStore.delete(cookie.name)
            }
        })

        return { success: 'Account deleted successfully', redirect: '/' }
    } catch (error: any) {
        console.error('Delete account error:', error)
        return { error: error.message || 'Failed to delete account' }
    }
}
