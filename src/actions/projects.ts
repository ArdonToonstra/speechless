'use server'

import { db, projects } from '@/db'
import { eq, and, or } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'
import { generateToken } from '@/lib/tokens'

export async function createProject(data: { title: string; speechReceiverName: string; type: string; date: string }) {
    const session = await requireAuth()

    try {
        const shareToken = generateToken()
        
        const [project] = await db.insert(projects).values({
            name: data.title,
            slug: data.speechReceiverName,
            occasionType: data.type,
            occasionDate: new Date(data.date),
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

export async function updateProjectContent(projectId: string, content: any) {
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
            return { error: 'Unauthorized or not found' }
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

export async function getProject(projectId: number) {
    const session = await requireAuth()

    const project = await db.query.projects.findFirst({
        where: and(
            eq(projects.id, projectId),
            eq(projects.ownerId, session.user.id)
        ),
    })

    return project
}

export async function getUserProjects() {
    const session = await requireAuth()

    const userProjects = await db.query.projects.findMany({
        where: eq(projects.ownerId, session.user.id),
        orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    })

    return userProjects
}
