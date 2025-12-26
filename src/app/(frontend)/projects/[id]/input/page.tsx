import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { QuestionnaireEditor } from '@/components/features/QuestionnaireEditor'
import { MessageSquareQuote } from 'lucide-react'

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
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquareQuote className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Input Gathering</h1>
                    <p className="text-muted-foreground">Design your questionnaire and collect answers.</p>
                </div>
            </div>

            <QuestionnaireEditor
                projectId={project.id}
                initialQuestions={project.questions as any}
                initialDescription={project.questionnaireDescription as string}
            />

            {/* TODO: Add Submissions View here */}
        </div>
    )
}
