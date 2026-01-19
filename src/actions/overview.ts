'use server'

import { db, projects } from '@/db'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuth } from './auth'

export async function updateProjectMetadata(projectId: number, formData: FormData) {
    const session = await requireAuth()

    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const dateKnown = formData.get('dateKnown') === 'true'
    const speechType = formData.get('speechType') as string
    const occasionType = formData.get('occasionType') as string
    const customOccasion = formData.get('customOccasion') as string
    const speechDescription = formData.get('speechDescription') as string
    const honoree = formData.get('honoree') as string
    const eventContext = formData.get('eventContext') as string
    const city = formData.get('city') as string
    const guestCount = formData.get('guestCount') as string

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
                occasionDate: date ? new Date(date) : null,
                dateKnown,
                speechType: speechType as 'gift' | 'occasion',
                occasionType,
                customOccasion: customOccasion || null,
                description: speechDescription || null,
                honoree: honoree || null,
                eventContext: eventContext || null,
                city: city || null,
                guestCount: guestCount ? parseInt(guestCount) : null,
                slug: honoree, // Keep slug in sync with honoree
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

export async function deleteProject(projectId: number) {
    const session = await requireAuth()

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

        await db.delete(projects).where(eq(projects.id, projectId))

        revalidatePath('/dashboard')
        return { success: true, redirect: '/dashboard' }
    } catch (error) {
        console.error('Failed to delete project:', error)
        return { error: 'Failed to delete project' }
    }
}
