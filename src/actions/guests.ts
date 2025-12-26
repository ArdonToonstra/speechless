'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function inviteGuest(projectId: number, formData: FormData) {
    const payload = await getPayload({ config })
    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as 'contributor' | 'collaborator'

    if (!email || !projectId) {
        return { error: 'Missing required fields' }
    }

    try {
        const guest = await payload.create({
            collection: 'guests',
            data: {
                email,
                name,
                project: projectId,
                role: role || 'contributor',
                status: 'invited',
                inviteEmailStatus: 'pending',
            },
        })

        // Mock email sending (console log for now)
        console.log(`[INVITE SYSTEM] Collaborator invite prepared for ${email}`)
        console.log(`Magic link: ${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/invite/${guest.token}`)
        console.log(`Project: ${projectId}, Role: ${role}`)

        revalidatePath(`/projects/${projectId}/collaborators`)
        return { success: true, message: 'Collaborator added. Email sending will be enabled in a future update.' }
    } catch (error) {
        console.error('Failed to invite guest:', error)
        return { error: 'Failed to invite guest' }
    }
}

export async function deleteGuest(guestId: number, projectId: number) {
    const payload = await getPayload({ config })

    try {
        await payload.delete({
            collection: 'guests',
            id: guestId,
        })

        revalidatePath(`/projects/${projectId}/settings`)
        return { success: true }
    } catch (error) {
        console.error('Failed to delete guest:', error)
        return { error: 'Failed to delete guest' }
    }
}

export async function updateGuestRole(guestId: number, projectId: number, newRole: 'contributor' | 'collaborator') {
    const payload = await getPayload({ config })

    try {
        await payload.update({
            collection: 'guests',
            id: guestId,
            data: {
                role: newRole,
            },
        })

        revalidatePath(`/projects/${projectId}/settings`)
        return { success: true }
    } catch (error) {
        console.error('Failed to update guest:', error)
        return { error: 'Failed to update guest' }
    }
}
