'use server'

import { db, projects } from '@/db'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'

export async function updateProjectMetadata(projectId: number, formData: FormData) {
    const session = await requireAuth()

    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const type = formData.get('type') as string
    const occasionType = formData.get('occasionType') as string
    const speechDescription = formData.get('speechDescription') as string
    const speechReceiverName = formData.get('speechReceiverName') as string

    try {
        // Verify ownership
        const project = await db.query.projects.findFirst({
            where: and(
                eq(projects.id, projectId),
                eq(projects.ownerId, session.user.id)
            ),
        })

        if (!project) {
            return { error: 'Project not found or unauthorized' }
        }

        await db.update(projects)
            .set({
                name: title,
                occasionDate: date ? new Date(date) : undefined,
                projectType: type,
                occasionType,
                description: speechDescription,
                slug: speechReceiverName,
                updatedAt: new Date(),
            })
            .where(eq(projects.id, projectId))

        revalidatePath(`/projects/${projectId}/overview`)
        // Also revalidate the layout since title is in the sidebar
        revalidatePath(`/projects/${projectId}`, 'layout')
        return { success: true }
    } catch (error) {
        console.error('Failed to update project metadata:', error)
        return { error: 'Failed to update details' }
    }
}
