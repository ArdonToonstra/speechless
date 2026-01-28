import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db, projects } from '@/db'
import { getSession } from '@/actions/auth'
import { InteractiveEditor } from '@/components/features/InteractiveEditor'
import { StandardPageShell } from '@/components/layout/StandardPageShell'

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    // Auth check
    const session = await getSession()
    if (!session?.user) return redirect('/login')

    // Fetch Project
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
            submissions: true
        }
    })

    if (!project || project.ownerId !== session.user.id) notFound()

    return (
        <StandardPageShell>
            <InteractiveEditor project={project as any} />
        </StandardPageShell>
    )
}
