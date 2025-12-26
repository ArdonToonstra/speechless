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
