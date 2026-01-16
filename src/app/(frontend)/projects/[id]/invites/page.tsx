import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { Send } from 'lucide-react'
import { db, projects, guests } from '@/db'
import { getSession } from '@/actions/auth'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { InviteSender } from '@/components/features/InviteSender'

export default async function InvitesPage({ params }: { params: Promise<{ id: string }> }) {
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

    if (!project) notFound()

    // Fetch Guests
    const projectGuests = await db.query.guests.findMany({
        where: eq(guests.projectId, projectId),
    })

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Send className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Send Invites</h1>
                        <p className="text-muted-foreground">Prepare invitations for your speech event</p>
                    </div>
                </div>

                <InviteSender project={project as any} guests={projectGuests as any} />
            </div>
        </StandardPageShell>
    )
}
