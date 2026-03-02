import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { ClipboardList } from 'lucide-react'
import { db, projects } from '@/db'
import { getSession } from '@/actions/auth'
import { QuestionnaireEditor } from '@/components/features/QuestionnaireEditor'
import { StandardPageShell } from '@/components/layout/StandardPageShell'

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
                    <div>
                        <h1 className="text-2xl font-bold">Questionnaire</h1>
                        <p className="text-muted-foreground">Manage your questions and share with guests</p>
                    </div>
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
