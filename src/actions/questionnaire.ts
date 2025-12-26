'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { revalidatePath } from 'next/cache'

export async function updateProjectQuestions(projectId: number, formData: FormData) {
    const payload = await getPayload({ config })
    const questionsJson = formData.get('questions') as string
    const description = formData.get('description') as string

    if (!questionsJson) {
        return { error: 'Missing questions' }
    }

    try {
        const questions = JSON.parse(questionsJson)

        await payload.update({
            collection: 'projects',
            id: projectId,
            data: {
                questions,
                questionnaireDescription: description,
            },
        })

        revalidatePath(`/projects/${projectId}/settings`)
        return { success: true }
    } catch (error) {
        console.error('Failed to update questions:', error)
        return { error: 'Failed to update questions' }
    }
}
