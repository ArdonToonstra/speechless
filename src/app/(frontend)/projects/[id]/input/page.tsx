import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq, desc } from 'drizzle-orm'
import { MessageSquareQuote } from 'lucide-react'
import { db, projects, submissions } from '@/db'
import { getSession } from '@/actions/auth'
import { QuestionnaireEditor } from '@/components/features/QuestionnaireEditor'
import { SubmissionsList } from '@/components/features/SubmissionsList'
import { AnswersByQuestion } from '@/components/features/AnswersByQuestion'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function InputPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    // Auth check
    const session = await getSession()
    if (!session?.user) return redirect('/login')

    // Fetch Project
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    })

    if (!project) notFound()

    // Fetch Submissions
    const projectSubmissions = await db.query.submissions.findMany({
        where: eq(submissions.projectId, projectId),
        orderBy: [desc(submissions.createdAt)],
    })

    // Get questions from project - handle both `text` and `question` field formats
    const rawQuestions = (project.questions || []) as Array<{ text?: string; question?: string }>
    const projectQuestions = rawQuestions.map(q => ({
        text: q.text || q.question || ''
    }))

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquareQuote className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Input Gathering</h1>
                        <p className="text-muted-foreground">Manage questions and view submissions</p>
                    </div>
                </div>

                <Tabs defaultValue="questions" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 bg-card border border-border">
                        <TabsTrigger value="questions">Questions</TabsTrigger>
                        <TabsTrigger value="submissions">
                            Submissions ({projectSubmissions.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="mt-0">
                        <QuestionnaireEditor
                            projectId={projectId}
                            initialQuestions={projectQuestions}
                            initialDescription={project.questionnaireIntro || ''}
                            speechReceiverName={project.honoree || undefined}
                            shareToken={project.shareToken || undefined}
                            occasionType={project.occasionType || 'other'}
                        />
                    </TabsContent>

                    <TabsContent value="submissions" className="mt-0">
                        <Tabs defaultValue="by-question" className="w-full">
                            <TabsList className="mb-6 bg-slate-100">
                                <TabsTrigger value="by-question" className="text-sm">
                                    By Question
                                </TabsTrigger>
                                <TabsTrigger value="list" className="text-sm">
                                    List View
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
                                />
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPageShell>
    )
}
