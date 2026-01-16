import React from 'react'
import { db, projects } from '@/db'
import { eq, and } from 'drizzle-orm'
import { Editor } from '@/components/editor/Editor'

export const dynamic = 'force-dynamic'

export default async function SharedProjectPage({ params }: { params: any }) {
    const { token } = await params

    const project = await db.query.projects.findFirst({
        where: and(
            eq(projects.shareToken, token),
            eq(projects.isPubliclyShared, true)
        ),
    })

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
                    <h1 className="text-2xl font-bold mb-4 font-serif">Link Expired or Invalid</h1>
                    <p className="text-slate-500">
                        The speech you are looking for is not available. Please check the link or contact the author.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">{project.name}</h1>
                    <p className="text-slate-500">Shared via Speechless</p>
                </div>

                <Editor
                    initialState={project.draft}
                    readOnly={true}
                />
            </div>
        </div>
    )
}
