'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Project, User } from '@/payload-types'
import { redirect } from 'next/navigation'

export async function createProject(data: { title: string; speechReceiverName: string; type: string; date: string }) {
    const payload = await getPayload({ config: configPromise })

    // Create project using local API
    // Note: 'owner' is automatically populated by 'defaultValue' in the collection hook
    // if accessed via admin, but here via Server Action we should probably set it manually or rely on req.user if we had headers context
    // Actually, standard Payload pattern in server action:
    // We need to know who the user is. Server Actions in Next.js/Payload don't auto-pass auth context as easily as API routes.
    // We should rely on `payload.auth` if we can, or just creating it.

    // CRITICAL: We need to get the current user.
    // In Next.js App Router + Payload, we can use `headers()`
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const authResult = await payload.auth({ headers: headersList })
    const user = authResult.user

    if (!user || !user.id || String(user.id) === 'NaN' || Number.isNaN(Number(user.id))) {
        return { error: 'Unauthorized' }
    }

    try {
        const project = await payload.create({
            collection: 'projects',
            data: {
                title: data.title,
                speechReceiverName: data.speechReceiverName,
                type: data.type as Project['type'],
                date: data.date,
                owner: user.id,
                status: 'draft',
            },
            user, // Pass the authenticated user context
        } as any)

        return { success: true, projectId: project.id, redirectUrl: `/projects/${project.id}/editor` }
    } catch (error) {
        console.error('Create Project Error:', error)
        return { error: 'Failed to create project' }
    }
}

export async function updateProjectContent(projectId: string, content: any) {
    const payload = await getPayload({ config: configPromise })

    // Auth check
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const authResult = await payload.auth({ headers: headersList })
    const user = authResult.user

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        // Verify ownership (optional but good practice, though Payload access control handles it too if using API)
        // Since we are using Local API as admin usually (unless we pass user context), we should be careful.
        // But here we are just calling local API. 
        // Best to check if user owns it.
        const project = await payload.findByID({
            collection: 'projects',
            id: projectId,
            depth: 0,
            user, // Pass user context for access control
        })

        if (!project || (typeof project.owner === 'object' ? project.owner.id : project.owner) !== user.id) {
            return { error: 'Unauthorized or not found' }
        }

        await payload.update({
            collection: 'projects',
            id: projectId,
            data: {
                content,
            },
            user, // Pass user context for access control
        })

        return { success: true }
    } catch (error) {
        console.error('Update Project Error:', error)
        return { error: 'Failed to update project' }
    }
}
