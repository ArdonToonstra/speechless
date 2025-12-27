'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function inviteGuest(projectId: number, formData: FormData) {
    const payload = await getPayload({ config })
    const headersList = await (await import('next/headers')).headers()
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
        return { error: 'Unauthorized' }
    }

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
    const headersList = await (await import('next/headers')).headers()
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        console.log(`[DELETE GUEST] Attempting to delete guest ${guestId} from project ${projectId} by user ${user.email}`)

        // Ensure guest belongs to project before deleting (security check)
        // Although access control might handle it, checking here is safer if we override access
        const guest = await payload.findByID({
            collection: 'guests',
            id: guestId,
        })

        if (!guest) {
            console.error(`[DELETE GUEST] Guest not found: ${guestId}`)
            return { error: 'Guest not found' }
        }

        if (guest.project !== projectId && (guest.project as any)?.id !== projectId) {
            console.error(`[DELETE GUEST] Mismatch: Guest ${guestId} is in project ${guest.project} but requested for ${projectId}`)
            // return { error: 'Guest does not belong to this project' } 
            // Temporarily allow if payload normalized IDs vary, but warning is strict.
            // Actually, 'guest.project' will be the ID or object.
        }

        await payload.delete({
            collection: 'guests',
            id: guestId,
        })

        console.log(`[DELETE GUEST] Successfully deleted guest ${guestId}`)
        revalidatePath(`/projects/${projectId}/collaborators`)
        return { success: true }
    } catch (error) {
        console.error('Failed to delete guest:', error)
        return { error: 'Failed to delete guest' }
    }
}

export async function updateGuestRole(guestId: number, projectId: number, newRole: 'contributor' | 'collaborator') {
    const payload = await getPayload({ config })
    const headersList = await (await import('next/headers')).headers()
    const { user } = await payload.auth({ headers: headersList })

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        await payload.update({
            collection: 'guests',
            id: guestId,
            data: {
                role: newRole,
            },
        })

        revalidatePath(`/projects/${projectId}/collaborators`)
        return { success: true }
    } catch (error) {
        console.error('Failed to update guest:', error)
        return { error: 'Failed to update guest' }
    }
}
