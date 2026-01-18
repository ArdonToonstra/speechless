import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq, desc } from 'drizzle-orm'
import { MessageSquareQuote } from 'lucide-react'
import { db, projects, submissions } from '@/db'
import { getSession } from '@/actions/auth'
import { QuestionnaireEditor } from '@/components/features/QuestionnaireEditor'
import { SubmissionsList } from '@/components/features/SubmissionsList'
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
                            initialQuestions={(project.questions as any) || []}
                            initialDescription={project.questionnaireIntro || ''}
                            shareToken={project.shareToken || undefined}
                        />
                    </TabsContent>

                    <TabsContent value="submissions" className="mt-0">
                        <SubmissionsList
                            submissions={projectSubmissions as any}
                            project={project as any}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPageShell>
    )
}
