import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { GuestManagement } from '@/components/features/GuestManagement'
import { StandardPageShell } from '@/components/layout/StandardPageShell'

export default async function CollaboratorsPage({ params }: { params: Promise<{ id: string }> }) {
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

    // Fetch Guests
    const guests = await payload.find({
        collection: 'guests',
        where: {
            project: {
                equals: projectId,
            },
        },
    })

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Collaborators</h1>
                        <p className="text-muted-foreground">Manage who contributes to this speech.</p>
                    </div>
                </div>

                <GuestManagement
                    projectId={projectId}
                    guests={guests.docs}
                    currentUserEmail={user.email}
                />
            </div>
        </StandardPageShell>
    )
}
