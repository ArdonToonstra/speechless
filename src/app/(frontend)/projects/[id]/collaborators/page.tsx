import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { Users } from 'lucide-react'
import { db, projects, guests } from '@/db'
import { getSession } from '@/actions/auth'
import { GuestManagement } from '@/components/features/GuestManagement'
import { StandardPageShell } from '@/components/layout/StandardPageShell'

export default async function CollaboratorsPage({ params }: { params: Promise<{ id: string }> }) {
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

    // Fetch Guests
    const guestList = await db.query.guests.findMany({
        where: eq(guests.projectId, projectId),
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
                    guests={guestList}
                    currentUserEmail={session.user.email}
                />
            </div>
        </StandardPageShell>
    )
}
