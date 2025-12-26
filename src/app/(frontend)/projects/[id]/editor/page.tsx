import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { InteractiveEditor } from '@/components/features/InteractiveEditor'

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
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
        <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 border-0 rounded-none bg-transparent shadow-none overflow-hidden">
                <InteractiveEditor project={project as any} />
            </div>
        </div>
    )
}
