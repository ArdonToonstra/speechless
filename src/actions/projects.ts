'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Project, User } from '@/payload-types'
import { redirect } from 'next/navigation'

export async function createProject(data: { title: string; type: string; date: string }) {
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
    const user = await payload.auth({ headers: headersList }) as unknown as User | null

    if (!user) {
        return { error: 'Unauthorized' }
    }

    try {
        const project = await payload.create({
            collection: 'projects',
            data: {
                title: data.title,
                type: data.type as Project['type'],
                date: data.date,
                owner: user.id,
                status: 'draft',
            },
        })

        return { success: true, projectId: project.id }
    } catch (error) {
        console.error('Create Project Error:', error)
        return { error: 'Failed to create project' }
    }
}
