import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'
import { ProjectOverview } from '@/components/features/ProjectOverview'

export default async function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
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
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <LayoutDashboard className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Overview</h1>
                    <p className="text-muted-foreground">Manage the basic details of your speech.</p>
                </div>
            </div>

            <ProjectOverview project={project as any} />
        </div>
    )
}
