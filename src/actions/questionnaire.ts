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

export async function submitQuestionnaire(data: {
    projectId: number
    token: string
    submitterName: string
    answers: { question: string; answer: string }[]
}) {
    const payload = await getPayload({ config })

    try {
        // Verify the project exists with this magic token
        const projects = await payload.find({
            collection: 'projects',
            where: {
                id: { equals: data.projectId },
                magicLinkToken: { equals: data.token },
            },
            limit: 1,
        })

        if (!projects.docs.length) {
            return { error: 'Invalid project or token' }
        }

        // For submissions, we need to associate with a guest
        // Since this is a public form, we'll create/find guest by the submitter's info
        // Or we can just create anonymous guest records

        // Find or create a guest for this submission
        // For now, let's create a temporary guest record
        const guest = await payload.create({
            collection: 'guests',
            data: {
                email: `${data.submitterName.toLowerCase().replace(/\s+/g, '_')}@anonymous.local`,
                name: data.submitterName,
                project: data.projectId,
                role: 'collaborator',
                status: 'active',
            },
        })

        // Create the submission
        await payload.create({
            collection: 'submissions',
            data: {
                project: data.projectId,
                guest: guest.id,
                submitterName: data.submitterName,
                answers: data.answers,
            },
        })

        // Revalidate the input page to show new submission
        revalidatePath(`/projects/${data.projectId}/input`)

        return { success: true }
    } catch (error) {
        console.error('Failed to submit questionnaire:', error)
        return { error: 'Failed to submit questionnaire' }
    }
}
