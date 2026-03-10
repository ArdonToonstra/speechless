'use server'

import { eq, and, ne } from 'drizzle-orm'
import { db, projects, guests } from '@/db'
import { requireAuth } from './auth'
import { sendSchedulingInviteEmail } from '@/lib/email'

export async function sendSchedulingToCollaborators(projectId: number) {
    const session = await requireAuth()

    const project = await db.query.projects.findFirst({
        where: and(
            eq(projects.id, projectId),
            eq(projects.ownerId, session.user.id)
        ),
    })

    if (!project) return { error: 'Project not found or unauthorized' }
    if (!project.shareToken) return { error: 'No share link generated yet' }

    const projectGuests = await db.query.guests.findMany({
        where: and(
            eq(guests.projectId, projectId),
            ne(guests.role, 'contributor')
        ),
    })

    const eligible = projectGuests.filter(g => g.status !== 'declined' && g.email && !g.email.endsWith('@anonymous.local'))

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://detoast.nl'
    const schedulingUrl = `${appUrl}/en/scheduling/${project.shareToken}`
    const ownerName = session.user.name || session.user.email

    let sent = 0
    for (const guest of eligible) {
        try {
            await sendSchedulingInviteEmail({
                to: guest.email,
                name: guest.name || undefined,
                projectName: project.name,
                schedulingUrl,
                ownerName,
            })
            sent++
        } catch (err) {
            console.error(`[SCHEDULING] Failed to send to ${guest.email}:`, err)
        }
    }

    return { success: true, sent }
}

export async function sendSchedulingToEmails(
    projectId: number,
    emails: { email: string; name?: string }[]
) {
    const session = await requireAuth()

    const project = await db.query.projects.findFirst({
        where: and(
            eq(projects.id, projectId),
            eq(projects.ownerId, session.user.id)
        ),
    })

    if (!project) return { error: 'Project not found or unauthorized' }
    if (!project.shareToken) return { error: 'No share link generated yet' }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://detoast.nl'
    const schedulingUrl = `${appUrl}/en/scheduling/${project.shareToken}`
    const ownerName = session.user.name || session.user.email

    let sent = 0
    for (const recipient of emails) {
        try {
            await sendSchedulingInviteEmail({
                to: recipient.email,
                name: recipient.name,
                projectName: project.name,
                schedulingUrl,
                ownerName,
            })
            sent++
        } catch (err) {
            console.error(`[SCHEDULING] Failed to send to ${recipient.email}:`, err)
        }
    }

    return { success: true, sent }
}
