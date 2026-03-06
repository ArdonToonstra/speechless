import React from 'react'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { Users } from 'lucide-react'
import { db, projects, guests } from '@/db'
import { getSession } from '@/actions/auth'
import { GuestManagement } from '@/components/features/GuestManagement'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { getTranslations } from 'next-intl/server'

export default async function CollaboratorsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    if (!session?.user) return redirect('/login')

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: { owner: true },
    })

    if (!project) notFound()

    const isOwner = project.ownerId === session.user.id
    const guestRecord = !isOwner
        ? await db.query.guests.findFirst({
            where: and(
                eq(guests.projectId, projectId),
                eq(guests.email, session.user.email),
                eq(guests.status, 'accepted')
            ),
        })
        : null

    const isSpeechEditor = guestRecord?.role === 'speech-editor'
    const canManage = isOwner || isSpeechEditor

    if (!isOwner && !guestRecord) notFound()

    const guestList = await db.query.guests.findMany({
        where: eq(guests.projectId, projectId),
        orderBy: (guests, { desc }) => [desc(guests.createdAt)],
    })

    const owner = {
        id: project.owner.id,
        name: project.owner.name,
        email: project.owner.email,
    }

    const t = await getTranslations('projects.collaborators')

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{t('title')}</h1>
                        <p className="text-muted-foreground">{t('description')}</p>
                    </div>
                </div>

                <GuestManagement
                    projectId={projectId}
                    guests={guestList}
                    owner={owner}
                    currentUserId={session.user.id}
                    canManage={canManage}
                />
            </div>
        </StandardPageShell>
    )
}
