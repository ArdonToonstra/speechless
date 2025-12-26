import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { MessageSquareQuote } from 'lucide-react'
import { QuestionnaireEditor } from '@/components/features/QuestionnaireEditor'
import { SubmissionsList } from '@/components/features/SubmissionsList'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function InputPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const payload = await getPayload({ config })

    // Auth check
    const { user } = await payload.auth({ headers: await (await import('next/headers')).headers() })
    if (!user) return redirect('/login')

    // Fetch Project
    const project = await payload.findByID({
        collection: 'projects',
        id: projectId,
        user,
    })

    if (!project) notFound()

    // Fetch Submissions
    const submissions = await payload.find({
        collection: 'submissions',
        where: {
            project: {
                equals: projectId,
            },
        },
        depth: 1,
        sort: '-createdAt',
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
                            Submissions ({submissions.totalDocs})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="questions" className="mt-0">
                        <QuestionnaireEditor
                            projectId={projectId}
                            initialQuestions={(project.questions as any) || []}
                            initialDescription={project.questionnaireDescription || ''}
                            speechReceiverName={project.speechReceiverName || undefined}
                            magicLinkToken={project.magicLinkToken || undefined}
                        />
                    </TabsContent>

                    <TabsContent value="submissions" className="mt-0">
                        <SubmissionsList
                            submissions={submissions.docs as any}
                            project={project as any}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </StandardPageShell>
    )
}
