import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { QuestionnaireForm } from '@/components/features/QuestionnaireForm'

export default async function QuestionnairePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params

    const payload = await getPayload({ config })

    // Find project by magic link token
    const projects = await payload.find({
        collection: 'projects',
        where: {
            magicLinkToken: {
                equals: token,
            },
        },
        limit: 1,
    })

    if (!projects.docs.length) {
        notFound()
    }

    const project = projects.docs[0]

    return (
        <div className="min-h-screen bg-muted/5 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                    <p className="text-muted-foreground">
                        {project.questionnaireDescription || 'We would love to get your input to help us write a great speech!'}
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
