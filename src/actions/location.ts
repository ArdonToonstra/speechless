'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'



import { locations } from '@/data/mock-locations'

export async function selectProjectLocation(projectId: number, locationSlug: string) {
    const payload = await getPayload({ config })
    const location = locations.find(l => l.slug === locationSlug)

    if (!location) {
        return { error: 'Location not found' }
    }

    try {
        await payload.update({
            collection: 'projects',
            id: projectId,
            data: {
                location: {
                    slug: location.slug,
                },
            },
        })

        revalidatePath(`/projects/${projectId}/location`)
        return { success: true }
    } catch (error) {
        console.error('Failed to select location:', error)
        return { error: 'Failed to select location' }
    }
}
