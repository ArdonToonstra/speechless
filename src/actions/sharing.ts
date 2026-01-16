'use server'

import { db, projects } from '@/db'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from './auth'
import { generateToken } from '@/lib/tokens'

export async function generateMagicLink(projectId: string) {
    const session = await requireAuth()

    try {
        // Verify ownership
        const project = await db.query.projects.findFirst({
            where: and(
                eq(projects.id, parseInt(projectId)),
                eq(projects.ownerId, session.user.id)
            ),
        })

        if (!project) {
            return { error: 'Unauthorized' }
        }

        const token = generateToken()

        await db.update(projects)
            .set({ 
                shareToken: token, 
                isPubliclyShared: true,
                updatedAt: new Date() 
            })
            .where(eq(projects.id, parseInt(projectId)))

        return { success: true, token }
    } catch (error) {
        console.error('Generate Magic Link Error:', error)
        return { error: 'Failed to generate link' }
    }
}

export async function toggleSharing(projectId: string, enabled: boolean) {
    const session = await requireAuth()

    try {
        const project = await db.query.projects.findFirst({
            where: and(
                eq(projects.id, parseInt(projectId)),
                eq(projects.ownerId, session.user.id)
            ),
        })

        if (!project) {
            return { error: 'Unauthorized' }
        }

        await db.update(projects)
            .set({ 
                isPubliclyShared: enabled,
                updatedAt: new Date() 
            })
            .where(eq(projects.id, parseInt(projectId)))

        return { success: true }
    } catch (error) {
        console.error('Toggle Sharing Error:', error)
        return { error: 'Failed to toggle sharing' }
    }
}
