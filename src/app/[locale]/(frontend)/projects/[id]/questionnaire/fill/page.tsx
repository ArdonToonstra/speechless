import React from 'react'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { eq, and } from 'drizzle-orm'
import { db, projects, guests, submissions } from '@/db'
import { getSession } from '@/actions/auth'
import { QuestionnaireFormCollaborator } from '@/components/features/QuestionnaireFormCollaborator'
import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export default async function QuestionnaireFillPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    if (!session?.user) return redirect('/login')

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    })

    if (!project) notFound()

    const guestRecord = await db.query.guests.findFirst({
        where: and(
            eq(guests.projectId, projectId),
            eq(guests.email, session.user.email)
        ),
    })

    const existingSubmission = guestRecord
        ? await db.query.submissions.findFirst({
            where: and(
                eq(submissions.projectId, projectId),
                eq(submissions.guestId, guestRecord.id)
            ),
        })
        : null

    const rawQuestions = (project.questions || []) as Array<{ text?: string; question?: string; required?: boolean }>
    const projectQuestions = rawQuestions.map(q => ({
        text: q.text || q.question || '',
        required: q.required,
    }))

    const t = await getTranslations('projects.fill')
    const tCommon = await getTranslations('common')

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full">
                <div className="text-center mb-8">
                    <Link
                        href={`/projects/${projectId}/questionnaire`}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        {tCommon('backToQuestionnaire')}
                    </Link>
                    <h1 className="text-3xl font-serif font-bold mb-2">{project.name}</h1>
                    <p className="text-muted-foreground">
                        {project.questionnaireIntro || t('defaultIntro')}
                    </p>
                    {existingSubmission && (
                        <p className="mt-2 text-sm text-amber-600 font-medium">
                            {t('alreadySubmitted')}
                        </p>
                    )}
                </div>

                <QuestionnaireFormCollaborator
                    project={{ id: project.id, questions: projectQuestions, speechReceiverName: project.honoree || undefined }}
                    userName={session.user.name || session.user.email}
                />
            </div>
        </div>
    )
}
