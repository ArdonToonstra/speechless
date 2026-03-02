import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db, projects } from '@/db'
import { getSession } from '@/actions/auth'
import { ProjectSidebar } from '@/components/features/ProjectSidebar'

export const dynamic = 'force-dynamic'

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    if (!session?.user) return redirect('/login')

    // Fetch current project to show title/context
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
            dateOptions: true
        }
    })

    if (!project) notFound()

    const hasDateOptions = project.dateOptions && project.dateOptions.length > 0
    const showScheduling = !project.dateKnown || hasDateOptions

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <ProjectSidebar
                projectId={project.id}
                projectTitle={project.name}
                user={session.user}
                occasion={project.occasionType}
                speechType={project.speechType as 'gift' | 'occasion'}
                showScheduling={showScheduling}
            />

            <main className="flex-1 flex flex-col overflow-hidden relative">
                {children}
            </main>
        </div>
    )
}
