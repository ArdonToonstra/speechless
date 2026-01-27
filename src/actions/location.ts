'use server'

import { db, projects } from '@/db'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'
import type { LocationSettings } from '@/db/schema'

export async function saveProjectLocation(
    projectId: number,
    locationData: LocationSettings
) {
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

        await db.update(projects)
            .set({
                locationSettings: locationData,
                updatedAt: new Date()
            })
            .where(eq(projects.id, projectId))

        revalidatePath(`/projects/${projectId}/location`)
        return { success: true }
    } catch (error) {
        console.error('Failed to save location:', error)
        return { error: 'Failed to save location' }
    }
}
