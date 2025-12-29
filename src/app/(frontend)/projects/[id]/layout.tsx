import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect, notFound } from 'next/navigation'
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

    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: await (await import('next/headers')).headers() })
    if (!user) return redirect('/login')

    // Fetch current project to show title/contex
    const project = await payload.findByID({
        collection: 'projects',
        id: projectId,
        user,
    })

    if (!project) notFound()

    return (
        <ProjectLayoutProvider>
            <div className="flex h-screen bg-background overflow-hidden">
                {/* Collapsible Sidebar */}
                <ProjectSidebar
                    projectId={project.id}
                    projectTitle={project.title}
                    user={user}
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
