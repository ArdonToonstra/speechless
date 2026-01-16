import React from 'react'
import { redirect, notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db, projects } from '@/db'
import { getSession } from '@/actions/auth'
import { ProjectSidebar } from '@/components/features/ProjectSidebar'
import { ProjectHeader } from '@/components/features/ProjectHeader'
import { ProjectLayoutProvider } from '@/components/layout/ProjectLayoutProvider'

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
    })

    if (!project) notFound()

    return (
        <ProjectLayoutProvider>
            <div className="flex h-screen bg-background overflow-hidden">
                {/* Collapsible Sidebar */}
                <ProjectSidebar
                    projectId={project.id}
                    projectTitle={project.name}
                    user={session.user}
                />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    <ProjectHeader project={project as any} />
                    {children}
                </main>
            </div>
        </ProjectLayoutProvider>
    )
}
