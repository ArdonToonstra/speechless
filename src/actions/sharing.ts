'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { User } from '@/payload-types'
import crypto from 'crypto'

export async function generateMagicLink(projectId: string) {
    const payload = await getPayload({ config: configPromise })

    // Auth check
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const authResult = await payload.auth({ headers: headersList })
    const user = authResult.user

    if (!user || !user.id || String(user.id) === 'NaN' || Number.isNaN(Number(user.id))) {
        return { error: 'Unauthorized' }
    }

    try {
        // Verify ownership
        const project = await payload.findByID({
            collection: 'projects',
            id: projectId,
        })

        if (!project || (typeof project.owner === 'object' ? project.owner.id : project.owner) !== user.id) {
            return { error: 'Unauthorized' }
        }

        const token = crypto.randomBytes(32).toString('hex')

        await payload.update({
            collection: 'projects',
            id: projectId,
            data: {
                magicLinkToken: token,
                magicLinkEnabled: true,
            },
        })

        return { success: true, token }
    } catch (error) {
        console.error('Generate Magic Link Error:', error)
        return { error: 'Failed to generate link' }
    }
}

export async function toggleSharing(projectId: string, enabled: boolean) {
    const payload = await getPayload({ config: configPromise })

    // Auth check
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const authResult = await payload.auth({ headers: headersList })
    const user = authResult.user

    if (!user || !user.id || String(user.id) === 'NaN' || Number.isNaN(Number(user.id))) {
        return { error: 'Unauthorized' }
    }

    try {
        const project = await payload.findByID({
            collection: 'projects',
            id: projectId,
        })

        if (!project || (typeof project.owner === 'object' ? project.owner.id : project.owner) !== user.id) {
            return { error: 'Unauthorized' }
        }

        await payload.update({
            collection: 'projects',
            id: projectId,
            data: {
                magicLinkEnabled: enabled,
            },
        })

        return { success: true }
    } catch (error) {
        console.error('Toggle Sharing Error:', error)
        return { error: 'Failed to toggle sharing' }
    }
}
