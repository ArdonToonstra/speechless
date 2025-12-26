import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { InteractiveEditor } from '@/components/features/InteractiveEditor'

export default async function ProjectEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const payload = await getPayload({ config: configPromise })

    // Auth check
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const authResult = await payload.auth({ headers: headersList })
    const user = authResult.user

    if (!user || !user.id || String(user.id) === 'NaN' || Number.isNaN(Number(user.id))) {
        const { redirect } = await import('next/navigation')
        redirect('/admin/login')
    }

    let project
    try {
        project = await payload.findByID({
            collection: 'projects',
            id,
            depth: 1,
            user, // Pass user for access control!
        })
    } catch (e) {
        notFound()
    }

    if (!project) notFound()

    return <InteractiveEditor project={project} />
}
