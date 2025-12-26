import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { Send } from 'lucide-react'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { InviteSender } from '@/components/features/InviteSender'

export default async function InvitesPage({ params }: { params: Promise<{ id: string }> }) {
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
        where: { project: { equals: projectId } },
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

                <InviteSender project={project as any} guests={guests.docs as any} />
            </div>
        </StandardPageShell>
    )
}
