import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { MessageSquareQuote } from 'lucide-react'
import { QuestionnaireEditor } from '@/components/features/QuestionnaireEditor'
import { StandardPageShell } from '@/components/layout/StandardPageShell'

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

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquareQuote className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Input Gathering</h1>
                        <p className="text-muted-foreground">Customize the questions for your guests.</p>
                    </div>
                </div>

                <QuestionnaireEditor
                    projectId={projectId}
                    initialQuestions={project.questions || []}
                    initialDescription={project.questionnaireDescription}
                />

                <div className="mt-8 pt-8 border-t">
                    <h2 className="text-xl font-bold mb-4">Submissions</h2>
                    {/* Placeholder for Submissions View */}
                    <div className="bg-muted/30 border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                        <p>No submissions yet. Invite guests to start gathering stories!</p>
                    </div>
                </div>
            </div>
        </StandardPageShell>
    )
}
