import React from 'react'
import { db, guests, projects } from '@/db'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { InviteAcceptance } from '@/components/features/InviteAcceptance'
import { getSession } from '@/actions/auth'
import { getLocale } from 'next-intl/server'

export const dynamic = 'force-dynamic'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const session = await getSession()
    const locale = await getLocale()

    const guest = await db.query.guests.findFirst({
        where: eq(guests.token, token),
    })

    if (!guest) notFound()

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, guest.projectId),
    })

    if (!project) notFound()

    if (session && session.user.email === guest.email) {
        if (guest.status !== 'accepted') {
            await db.update(guests)
                .set({ status: 'accepted', updatedAt: new Date() })
                .where(eq(guests.id, guest.id))
        }
        redirect(`/${locale}/projects/${project.id}/overview`)
    }

    return (
        <InviteAcceptance
            guest={guest as any}
            project={project as any}
            token={token}
        />
    )
}
