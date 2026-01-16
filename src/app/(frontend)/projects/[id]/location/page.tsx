import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { MapPin } from 'lucide-react'
import { db, projects } from '@/db'
import { getSession } from '@/actions/auth'
import { LocationManager } from '@/components/features/LocationManager'
import { StandardPageShell } from '@/components/layout/StandardPageShell'

export default async function LocationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    // Auth check
    const session = await getSession()
    if (!session?.user) return redirect('/login')

    // Fetch Project
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    })

    if (!project || project.ownerId !== session.user.id) notFound()

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Location & Logistics</h1>
                        <p className="text-muted-foreground">Details about when and where.</p>
                    </div>
                </div>

                <LocationManager projectId={project.id} location={project.locationSettings || {}} />
            </div>
        </StandardPageShell>
    )
}
