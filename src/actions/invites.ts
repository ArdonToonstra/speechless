'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

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
    const payload = await getPayload({ config })

    try {
        // Get auth context
        const { user } = await payload.auth({ headers: await (await import('next/headers')).headers() })
        if (!user) {
            return { success: false, message: 'Not authenticated', recipientCount: 0 }
        }

        // Verify user owns this project
        const project = await payload.findByID({
            collection: 'projects',
            id: projectId,
            user,
        })

        if (!project) {
            return { success: false, message: 'Project not found', recipientCount: 0 }
        }

        // Create invitation records for each recipient
        for (const recipient of recipients) {
            await payload.create({
                collection: 'invitations',
                data: {
                    email: recipient.email,
                    name: recipient.name,
                    project: projectId,
                    type: messageType,
                    customMessage,
                    sendViaPostcard,
                    status: 'prepared',
                },
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
    const payload = await getPayload({ config })

    try {
        const { user } = await payload.auth({ headers: await (await import('next/headers')).headers() })
        if (!user) {
            return { success: false, message: 'Not authenticated' }
        }

        const fieldName = messageType === 'attendee' ? 'emailTemplates.attendeeMessage' : 'emailTemplates.receiverMessage'

        await payload.update({
            collection: 'projects',
            id: projectId,
            data: {
                emailTemplates: {
                    [messageType === 'attendee' ? 'attendeeMessage' : 'receiverMessage']: message,
                },
            },
        })

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
    const payload = await getPayload({ config })

    try {
        const project = await payload.findByID({
            collection: 'projects',
            id: projectId,
        })

        if (!project || !project.date) {
            return { eligible: false, daysUntilEvent: 0 }
        }

        const eventDate = new Date(project.date)
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
