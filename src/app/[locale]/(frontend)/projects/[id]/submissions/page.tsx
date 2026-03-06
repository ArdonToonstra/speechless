import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq, desc, asc } from 'drizzle-orm'
import { Inbox } from 'lucide-react'
import { db, projects, submissions, comments } from '@/db'
import { getSession } from '@/actions/auth'
import { SubmissionsList } from '@/components/features/SubmissionsList'
import { AnswersByQuestion } from '@/components/features/AnswersByQuestion'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getLocale, getTranslations } from 'next-intl/server'

export default async function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    const locale = await getLocale()
    if (!session?.user) return redirect(`/${locale}/login`)

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    })

    if (!project) notFound()

    const projectSubmissions = await db.query.submissions.findMany({
        where: eq(submissions.projectId, projectId),
        orderBy: [desc(submissions.createdAt)],
        with: { comments: { orderBy: [asc(comments.createdAt)] } },
    })

    const rawQuestions = (project.questions || []) as Array<{ text?: string; question?: string }>
    const projectQuestions = rawQuestions.map(q => ({
        text: q.text || q.question || ''
    }))

    const t = await getTranslations('projects.submissions')

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Inbox className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-2xl font-bold">{t('title')}</h1>
                            <p className="text-muted-foreground">{t('description')}</p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {projectSubmissions.length}
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="by-question" className="w-full">
                    <TabsList className="mb-6 bg-slate-100">
                        <TabsTrigger value="by-question" className="text-sm">
                            {t('byQuestion')}
                        </TabsTrigger>
                        <TabsTrigger value="list" className="text-sm">
                            {t('listView')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="by-question" className="mt-0">
                        <AnswersByQuestion
                            submissions={projectSubmissions as any}
                            questions={projectQuestions}
                            speechReceiverName={project.honoree || undefined}
                        />
                    </TabsContent>

                    <TabsContent value="list" className="mt-0">
                        <SubmissionsList
                            submissions={projectSubmissions as any}
                            project={project as any}
                            projectId={projectId}
                            authorName={session.user.name}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPageShell>
    )
}
