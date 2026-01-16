'use server'

import { db, projects, guests, submissions } from '@/db'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { requireAuth } from './auth'
import type { QuestionItem, AnswerItem } from '@/db/schema'

export async function updateProjectQuestions(projectId: number, formData: FormData) {
    const session = await requireAuth()
    
    const questionsJson = formData.get('questions') as string
    const description = formData.get('description') as string

    if (!questionsJson) {
        return { error: 'Missing questions' }
    }

    try {
        // Verify ownership
        const project = await db.query.projects.findFirst({
            where: and(
                eq(projects.id, projectId),
                eq(projects.ownerId, session.user.id)
            ),
        })

        if (!project) {
            return { error: 'Project not found or unauthorized' }
        }

        const questions = JSON.parse(questionsJson) as QuestionItem[]

        await db.update(projects)
            .set({ 
                questions, 
                questionnaireIntro: description,
                updatedAt: new Date() 
            })
            .where(eq(projects.id, projectId))

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
    console.log('[submitQuestionnaire] Starting submission...')
    console.log('[submitQuestionnaire] Data:', { projectId: data.projectId, token: data.token, submitterName: data.submitterName })

    try {
        // Verify the project exists with this share token
        console.log('[submitQuestionnaire] Verifying project...')
        const project = await db.query.projects.findFirst({
            where: and(
                eq(projects.id, data.projectId),
                eq(projects.shareToken, data.token)
            ),
        })

        console.log('[submitQuestionnaire] Project found:', !!project)

        if (!project) {
            console.error('[submitQuestionnaire] Invalid project or token')
            return { error: 'Invalid project or token' }
        }

        // Create a temporary guest record for this submission
        console.log('[submitQuestionnaire] Creating guest record...')
        const [guest] = await db.insert(guests).values({
            email: `${data.submitterName.toLowerCase().replace(/\s+/g, '_')}@anonymous.local`,
            name: data.submitterName,
            projectId: data.projectId,
            role: 'contributor',
            status: 'accepted',
        }).returning()

        console.log('[submitQuestionnaire] Guest created:', guest.id)

        // Filter out empty answers
        const validAnswers: AnswerItem[] = data.answers
            .filter(a => a.answer && a.answer.trim().length > 0)
            .map(a => ({
                questionId: '', // Will be matched by question text
                question: a.question,
                answer: a.answer,
            }))

        console.log('[submitQuestionnaire] Creating submission with', validAnswers.length, 'answers...')
        
        const [submission] = await db.insert(submissions).values({
            projectId: data.projectId,
            guestId: guest.id,
            submitterName: data.submitterName,
            answers: validAnswers,
        }).returning()

        console.log('[submitQuestionnaire] Submission created:', submission.id)

        revalidatePath(`/projects/${data.projectId}/submissions`)
        return { success: true, submissionId: submission.id }
    } catch (error) {
        console.error('[submitQuestionnaire] Error:', error)
        return { error: 'Failed to submit questionnaire' }
    }
}
