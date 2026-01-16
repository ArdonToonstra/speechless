'use server'

import { db, projects } from '@/db'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'
import { locations } from '@/data/mock-locations'
import type { LocationSettings } from '@/db/schema'

export async function selectProjectLocation(projectId: number, locationSlug: string) {
    const session = await requireAuth()
    
    const location = locations.find(l => l.slug === locationSlug)

    if (!location) {
        return { error: 'Location not found' }
    }

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

        const locationSettings: LocationSettings = {
            slug: location.slug,
        }

        await db.update(projects)
            .set({ 
                locationSettings,
                updatedAt: new Date() 
            })
            .where(eq(projects.id, projectId))

        revalidatePath(`/projects/${projectId}/location`)
        return { success: true }
    } catch (error) {
        console.error('Failed to select location:', error)
        return { error: 'Failed to select location' }
    }
}
