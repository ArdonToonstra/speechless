import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect, notFound } from 'next/navigation'
import { ProjectSidebar } from '@/components/features/ProjectSidebar'

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
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Collapsible Sidebar */}
            <ProjectSidebar
                projectId={project.id}
                projectTitle={project.title}
                user={user}
            />

            {/* Main Content Area - Header Removed */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {children}
            </main>
        </div>
    )
}
