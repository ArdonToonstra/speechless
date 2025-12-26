import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, redirect } from 'next/navigation'
import { InviteAcceptance } from '@/components/features/InviteAcceptance'

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params

    const payload = await getPayload({ config })

    // Check if user is already logged in
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const authResult = await payload.auth({ headers: headersList })
    const currentUser = authResult.user

    // Find guest by token
    const guests = await payload.find({
        collection: 'guests',
        where: {
            token: {
                equals: token,
            },
        },
        limit: 1,
        depth: 1,
    })

    if (!guests.docs.length) {
        notFound()
    }

    const guest = guests.docs[0]
    const project = typeof guest.project === 'object' ? guest.project : null

    if (!project) {
        notFound()
    }

    // If user is logged in and email matches the guest email, grant access
    if (currentUser && currentUser.email === guest.email) {
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
