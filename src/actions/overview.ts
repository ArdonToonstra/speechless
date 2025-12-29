'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'
import { Project } from '@/payload-types'

export async function updateProjectMetadata(projectId: number, formData: FormData) {
    const payload = await getPayload({ config })

    const title = formData.get('title') as string
    const date = formData.get('date') as string
    const type = formData.get('type') as Project['type']
    const occasionType = formData.get('occasionType') as Project['occasionType']
    const speechDescription = formData.get('speechDescription') as string
    const speechReceiverName = formData.get('speechReceiverName') as string

    try {
        await payload.update({
            collection: 'projects',
            id: projectId,
            data: {
                title,
                date,
                type,
                occasionType,
                speechDescription,
                speechReceiverName,
            },
        })

        revalidatePath(`/projects/${projectId}/overview`)
        // Also revalidate the layout since title is in the sidebar
        revalidatePath(`/projects/${projectId}`, 'layout')
        return { success: true }
    } catch (error) {
        console.error('Failed to update project metadata:', error)
        return { error: 'Failed to update details' }
    }
}
