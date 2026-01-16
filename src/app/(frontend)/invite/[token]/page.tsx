import React from 'react'
import { db, guests, projects } from '@/db'
import { eq } from 'drizzle-orm'
import { notFound, redirect } from 'next/navigation'
import { InviteAcceptance } from '@/components/features/InviteAcceptance'
import { getSession } from '@/actions/auth'

export const dynamic = 'force-dynamic'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params
    const session = await getSession()

    // Find guest by token
    const guest = await db.query.guests.findFirst({
        where: eq(guests.token, token),
    })

    if (!guest) {
        notFound()
    }

    // Get the project
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, guest.projectId),
    })

    if (!project) {
        notFound()
    }

    // If user is logged in and email matches the guest email, grant access
    if (session && session.user.email === guest.email) {
        // Mark guest as accepted if not already
        if (guest.status !== 'accepted') {
            await db.update(guests)
                .set({ status: 'accepted', updatedAt: new Date() })
                .where(eq(guests.id, guest.id))
        }
        // Redirect to the project
        redirect(`/projects/${project.id}/overview`)
    }

    // Show invite acceptance page
    return (
        <InviteAcceptance
            guest={guest as any}
            project={project as any}
            token={token}
        />
    )
}
