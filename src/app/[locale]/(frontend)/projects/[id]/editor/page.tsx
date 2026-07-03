import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq, and, isNull, asc } from 'drizzle-orm'
import { db, projects, comments } from '@/db'
import { getSession } from '@/actions/auth'
import { getProjectForManager } from '@/lib/permissions'
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

    // Editing is manager-only (owner or accepted speech-editor) — matches updateProjectContent.
    // Plain collaborators read the speech via the share link instead.
    const canEdit = await getProjectForManager(projectId, session.user.id, session.user.email)
    if (!canEdit) notFound()

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: { submissions: true }
    })

    if (!project) notFound()

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
