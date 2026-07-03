'use server'

import type { JSONContent } from '@tiptap/core'
import { db, projects } from '@/db'
import { eq, and, or } from 'drizzle-orm'
import { requireAuth } from './auth'
import { generateToken } from '@/lib/tokens'
import { getProjectForManager } from '@/lib/permissions'

export async function createProject(data: {
    title: string
    speechReceiverName: string
    occasionType: string
    customOccasion?: string
    speechType: 'gift' | 'occasion'
    date?: string
    dateKnown: boolean
    honoree: string
    eventContext?: string
    city?: string
    guestCount?: number
}) {
    const session = await requireAuth()

    try {
        const shareToken = generateToken()
        
        const [project] = await db.insert(projects).values({
            name: data.title,
            slug: data.speechReceiverName,
            occasionType: data.occasionType,
            customOccasion: data.customOccasion,
            speechType: data.speechType,
            occasionDate: data.date ? new Date(data.date) : null,
            dateKnown: data.dateKnown,
            honoree: data.honoree,
            eventContext: data.eventContext,
            city: data.city,
            guestCount: data.guestCount,
            ownerId: session.user.id,
            status: 'draft',
            shareToken,
        }).returning()

        return { success: true, projectId: project.id, redirectUrl: `/projects/${project.id}/editor` }
    } catch (error) {
        console.error('Create Project Error:', error)
        return { error: 'Failed to create project' }
    }
}

export async function updateProjectContent(projectId: string, content: JSONContent) {
    const session = await requireAuth()

    try {
        // Owner or accepted speech-editor may save the draft
        const project = await getProjectForManager(parseInt(projectId), session.user.id, session.user.email)

        if (!project) {
            return { error: 'You do not have permission to edit this speech' }
        }

        await db.update(projects)
            .set({ draft: content, updatedAt: new Date() })
            .where(eq(projects.id, parseInt(projectId)))

        return { success: true }
    } catch (error) {
        console.error('Update Project Error:', error)
        return { error: 'Failed to update project' }
    }
}

