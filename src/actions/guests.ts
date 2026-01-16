'use server'

import { db, guests, projects } from '@/db'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'
import { generateToken } from '@/lib/tokens'

export async function inviteGuest(projectId: number, formData: FormData) {
    const session = await requireAuth()

    const email = formData.get('email') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as 'contributor' | 'collaborator'

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
            role: role || 'contributor',
            status: 'invited',
            emailStatus: 'pending',
            token,
        }).returning()

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
        revalidatePath(`/projects/${projectId}/collaborators`)
        return { success: true }
    } catch (error) {
        console.error('Failed to delete guest:', error)
        return { error: 'Failed to delete guest' }
    }
}

export async function updateGuestRole(guestId: number, projectId: number, newRole: 'contributor' | 'collaborator') {
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

        revalidatePath(`/projects/${projectId}/collaborators`)
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
        where: eq(guests.projectId, projectId),
        orderBy: (guests, { desc }) => [desc(guests.createdAt)],
    })

    return projectGuests
}
