import React from 'react'
import { db, projects } from '@/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { QuestionnaireForm } from '@/components/features/QuestionnaireForm'

export const dynamic = 'force-dynamic'

export default async function QuestionnairePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params

    // Find project by share token
    const project = await db.query.projects.findFirst({
        where: eq(projects.shareToken, token),
    })

    if (!project) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-muted/5 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
                    <p className="text-muted-foreground">
                        {project.questionnaireIntro || 'We would love to get your input to help us write a great speech!'}
                    </p>
                </div>

                <QuestionnaireForm
                    project={project as any}
                    token={token}
                />
            </div>
        </div>
    )
}
