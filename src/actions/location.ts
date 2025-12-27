'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function updateProjectLocation(projectId: number, formData: FormData) {
    const payload = await getPayload({ config })

    const venue = formData.get('venue') as string
    const address = formData.get('address') as string
    const time = formData.get('time') as string
    const notes = formData.get('notes') as string

    try {
        await payload.update({
            collection: 'projects',
            id: projectId,
            data: {
                location: {
                    venue,
                    address,
                    time,
                    notes,
                },
            },
        })
        revalidatePath(`/projects/${projectId}/location`)
        return { success: true }
    } catch (error) {
        console.error('Failed to update location:', error)
        return { error: 'Failed to update location' }
    }
}

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
                    venue: location.name,
                    address: location.details.address,
                    // We preserve existing time/notes if user wants, 
                    // or we could append amenities to notes? 
                    // Let's just set the main fields for now.
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
