import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { ClipboardList, PenLine } from 'lucide-react'
import { db, projects, guests, submissions } from '@/db'
import { getSession } from '@/actions/auth'
import { QuestionnaireEditor } from '@/components/features/QuestionnaireEditor'
import { QuestionnaireFormCollaborator } from '@/components/features/QuestionnaireFormCollaborator'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function QuestionnairePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    if (!session?.user) return redirect('/login')

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    })

    if (!project) notFound()

    const isOwner = project.ownerId === session.user.id

    // Owner sees the editor
    if (isOwner) {
        const rawQuestions = (project.questions || []) as Array<{ text?: string; question?: string }>
        const projectQuestions = rawQuestions.map(q => ({
            text: q.text || q.question || ''
        }))

        return (
            <StandardPageShell>
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center gap-3 pb-6 border-b">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ClipboardList className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">Questionnaire</h1>
                            <p className="text-muted-foreground">Manage your questions and share with guests</p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="gap-2">
                            <Link href={`/projects/${projectId}/questionnaire/fill`}>
                                <PenLine className="w-4 h-4" />
                                Fill in my response
                            </Link>
                        </Button>
                    </div>

                    <QuestionnaireEditor
                        projectId={projectId}
                        initialQuestions={projectQuestions}
                        initialDescription={project.questionnaireIntro || ''}
                        speechReceiverName={project.honoree || undefined}
                        shareToken={project.shareToken || undefined}
                        occasionType={project.occasionType || 'other'}
                    />
                </div>
            </StandardPageShell>
        )
    }

    // Collaborator — check if they've already submitted
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

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold mb-2">{project.name}</h1>
                    <p className="text-muted-foreground">
                        {project.questionnaireIntro || 'We would love to get your input to help us write a great speech!'}
                    </p>
                    {existingSubmission && (
                        <p className="mt-2 text-sm text-amber-600 font-medium">
                            You have already submitted a response. Submitting again will add a new entry.
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
