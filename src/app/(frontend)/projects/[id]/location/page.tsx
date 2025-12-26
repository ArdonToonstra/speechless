import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { LocationManager } from '@/components/features/LocationManager'
import { StandardPageShell } from '@/components/layout/StandardPageShell'

export default async function LocationPage({ params }: { params: Promise<{ id: string }> }) {
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

                <LocationManager project={project} />
            </div>
        </StandardPageShell>
    )
}
