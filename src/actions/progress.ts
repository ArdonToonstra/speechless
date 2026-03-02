'use server'

import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db, projects } from '@/db'
import { requireAuth } from './auth'

export async function toggleProgressCheck(
    projectId: number,
    stepId: string,
    checked: boolean
): Promise<{ success: boolean; error?: string }> {
    const session = await requireAuth()

    const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, projectId), eq(projects.ownerId, session.user.id)),
    })

    if (!project) {
        return { success: false, error: 'Project not found or unauthorized' }
    }

    const current = (project.progressChecks || []) as string[]
    const updated = checked
        ? Array.from(new Set([...current, stepId]))
        : current.filter(id => id !== stepId)

    try {
        await db.update(projects)
            .set({ progressChecks: updated, updatedAt: new Date() })
            .where(eq(projects.id, projectId))

        revalidatePath(`/projects/${projectId}/progress`)
        return { success: true }
    } catch (error) {
        console.error('Failed to toggle progress check:', error)
        return { success: false, error: 'Failed to save' }
    }
}
