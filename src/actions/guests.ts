'use server'

import { db, guests, projects } from '@/db'
import { eq, and, ne } from 'drizzle-orm'
import { revalidateForAllLocales } from '@/lib/revalidation'
import { requireAuth } from './auth'
import { generateToken } from '@/lib/tokens'
import { sendCollaboratorInviteEmail } from '@/lib/email'

export async function inviteGuest(projectId: number, formData: FormData) {
    const session = await requireAuth()

    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as 'collaborator' | 'speech-editor'

    if (!email || !projectId) {
        return { error: 'Missing required fields' }
    }

    try {
        // Verify user owns the project
        const project = await db.query.projects.findFirst({
            where: and(
                eq(projects.id, projectId),
                eq(projects.ownerId, session.user.id)
            ),
        })

        if (!project) {
            return { error: 'Project not found or unauthorized' }
        }

        const token = generateToken()

        const [guest] = await db.insert(guests).values({
            email,
            name,
            projectId,
            role: role || 'collaborator',
            status: 'invited',
            emailStatus: 'pending',
            token,
        }).returning()

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://detoast.nl'
        const projectUrl = `${appUrl}/en/projects/${projectId}`
        let emailStatus: 'sent' | 'pending' = 'pending'

        try {
            await sendCollaboratorInviteEmail({
                to: email,
                name: name || undefined,
                projectName: project.name,
                projectUrl,
                role: (role || 'collaborator') as 'collaborator' | 'speech-editor',
                inviterName: session.user.name || session.user.email,
            })
            emailStatus = 'sent'
        } catch (err) {
            console.error('[INVITE] Failed to send invite email:', err)
        }

        if (emailStatus === 'sent') {
            await db.update(guests).set({ emailStatus: 'sent' }).where(eq(guests.id, guest.id))
        }

        revalidateForAllLocales(`/projects/${projectId}/collaborators`)
        return { success: true, message: 'Invite sent!' }
    } catch (error) {
        console.error('Failed to invite guest:', error)
        return { error: 'Failed to invite guest' }
    }
}

export async function deleteGuest(guestId: number, projectId: number) {
    const session = await requireAuth()

    try {
        console.log(`[DELETE GUEST] Attempting to delete guest ${guestId} from project ${projectId} by user ${session.user.email}`)

        // Verify user owns the project
        const project = await db.query.projects.findFirst({
            where: and(
                eq(projects.id, projectId),
                eq(projects.ownerId, session.user.id)
            ),
        })

        if (!project) {
            return { error: 'Project not found or unauthorized' }
        }

        // Verify guest belongs to project
        const guest = await db.query.guests.findFirst({
            where: and(
                eq(guests.id, guestId),
                eq(guests.projectId, projectId)
            ),
        })

        if (!guest) {
            console.error(`[DELETE GUEST] Guest not found: ${guestId}`)
            return { error: 'Guest not found' }
        }

        await db.delete(guests).where(eq(guests.id, guestId))

        console.log(`[DELETE GUEST] Successfully deleted guest ${guestId}`)
        revalidateForAllLocales(`/projects/${projectId}/collaborators`)
        return { success: true }
    } catch (error) {
        console.error('Failed to delete guest:', error)
        return { error: 'Failed to delete guest' }
    }
}

export async function updateGuestRole(guestId: number, projectId: number, newRole: 'collaborator' | 'speech-editor') {
    const session = await requireAuth()

    try {
        // Verify user owns the project
        const project = await db.query.projects.findFirst({
            where: and(
                eq(projects.id, projectId),
                eq(projects.ownerId, session.user.id)
            ),
        })

        if (!project) {
            return { error: 'Project not found or unauthorized' }
        }

        await db.update(guests)
            .set({ role: newRole, updatedAt: new Date() })
            .where(and(eq(guests.id, guestId), eq(guests.projectId, projectId)))

        revalidateForAllLocales(`/projects/${projectId}/collaborators`)
        return { success: true }
    } catch (error) {
        console.error('Failed to update guest role:', error)
        return { error: 'Failed to update role' }
    }
}

export async function getProjectGuests(projectId: number) {
    const session = await requireAuth()

    // Verify user owns the project
    const project = await db.query.projects.findFirst({
        where: and(
            eq(projects.id, projectId),
            eq(projects.ownerId, session.user.id)
        ),
    })

    if (!project) {
        return []
    }

    const projectGuests = await db.query.guests.findMany({
        where: and(eq(guests.projectId, projectId), ne(guests.role, 'owner')),
        orderBy: (guests, { desc }) => [desc(guests.createdAt)],
    })

    return projectGuests
}
