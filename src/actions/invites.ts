'use server'

import { db, invitations, projects } from '@/db'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'
import type { EmailTemplates } from '@/db/schema'

/**
 * Prepare speech invites (mock email sending for now)
 * In the future, this will send actual emails
 */
export async function prepareSpeechInvites(
    projectId: number,
    recipients: Array<{ email: string; name?: string }>,
    messageType: 'attendee' | 'receiver',
    customMessage: string,
    sendViaPostcard: boolean
): Promise<{ success: boolean; message: string; recipientCount: number }> {
    const session = await requireAuth()

    try {
        // Verify user owns this project
        const project = await db.query.projects.findFirst({
            where: and(
                eq(projects.id, projectId),
                eq(projects.ownerId, session.user.id)
            ),
        })

        if (!project) {
            return { success: false, message: 'Project not found', recipientCount: 0 }
        }

        // Create invitation records for each recipient
        for (const recipient of recipients) {
            await db.insert(invitations).values({
                email: recipient.email,
                name: recipient.name,
                projectId,
                role: messageType,
                personalMessage: customMessage,
                isPremium: sendViaPostcard,
                emailStatus: 'prepared',
            })
        }

        // Log to console (mock email sending)
        console.log(`[INVITE SYSTEM] Prepared ${recipients.length} invites for project ${projectId}`)
        console.log(`Message type: ${messageType}`)
        console.log(`Send via postcard: ${sendViaPostcard}`)
        console.log(`Recipients:`, recipients)
        console.log(`Custom message:`, customMessage)

        revalidatePath(`/projects/${projectId}/invites`)

        return {
            success: true,
            message: `Successfully prepared ${recipients.length} invite${recipients.length > 1 ? 's' : ''}. Email sending will be enabled in a future update.`,
            recipientCount: recipients.length,
        }
    } catch (error) {
        console.error('Failed to prepare invites:', error)
        return { success: false, message: 'Failed to prepare invites', recipientCount: 0 }
    }
}

/**
 * Save custom email template for a project
 */
export async function saveInviteTemplate(
    projectId: number,
    messageType: 'attendee' | 'receiver',
    message: string
): Promise<{ success: boolean; message?: string }> {
    const session = await requireAuth()

    try {
        // Get current project to merge email templates
        const project = await db.query.projects.findFirst({
            where: and(
                eq(projects.id, projectId),
                eq(projects.ownerId, session.user.id)
            ),
        })

        if (!project) {
            return { success: false, message: 'Project not found' }
        }

        const currentTemplates = (project.emailTemplates || {}) as EmailTemplates
        const updatedTemplates: EmailTemplates = {
            ...currentTemplates,
            [messageType]: message,
        }

        await db.update(projects)
            .set({ emailTemplates: updatedTemplates, updatedAt: new Date() })
            .where(eq(projects.id, projectId))

        revalidatePath(`/projects/${projectId}/invites`)
        return { success: true }
    } catch (error) {
        console.error('Failed to save template:', error)
        return { success: false, message: 'Failed to save template' }
    }
}

/**
 * Validate if postcard option is eligible (event must be >5 days away)
 */
export async function validatePostcardOption(
    projectId: number
): Promise<{ eligible: boolean; daysUntilEvent: number }> {
    try {
        const project = await db.query.projects.findFirst({
            where: eq(projects.id, projectId),
        })

        if (!project || !project.occasionDate) {
            return { eligible: false, daysUntilEvent: 0 }
        }

        const eventDate = new Date(project.occasionDate)
        const today = new Date()
        const diffTime = eventDate.getTime() - today.getTime()
        const daysUntilEvent = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return {
            eligible: daysUntilEvent >= 5,
            daysUntilEvent,
        }
    } catch (error) {
        console.error('Failed to validate postcard option:', error)
        return { eligible: false, daysUntilEvent: 0 }
    }
}
