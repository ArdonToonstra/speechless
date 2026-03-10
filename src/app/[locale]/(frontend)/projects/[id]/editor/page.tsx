import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq, and, isNull, asc } from 'drizzle-orm'
import { db, projects, guests, comments } from '@/db'
import { getSession } from '@/actions/auth'
import { InteractiveEditor } from '@/components/features/InteractiveEditor'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { getLocale } from 'next-intl/server'

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    const locale = await getLocale()
    if (!session?.user) return redirect(`/${locale}/login`)

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: { submissions: true }
    })

    if (!project) notFound()

    if (project.ownerId !== session.user.id) {
        const guest = await db.query.guests.findFirst({
            where: and(eq(guests.projectId, projectId), eq(guests.email, session.user.email), eq(guests.status, 'accepted')),
        })
        if (!guest) notFound()
    }

    const speechComments = await db.query.comments.findMany({
        where: and(eq(comments.projectId, projectId), isNull(comments.submissionId)),
        orderBy: [asc(comments.createdAt)],
    })

    return (
        <StandardPageShell>
            <InteractiveEditor
                project={project as any}
                speechComments={speechComments as any}
                authorName={session.user.name}
            />
        </StandardPageShell>
    )
}
