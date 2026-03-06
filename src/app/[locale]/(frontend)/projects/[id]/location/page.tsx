import React from 'react'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { MapPin } from 'lucide-react'
import { db, projects } from '@/db'
import { getSession } from '@/actions/auth'
import { LocationPicker } from '@/components/features/LocationPicker'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { getTranslations } from 'next-intl/server'

export default async function LocationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    if (!session?.user) return redirect('/login')

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    })

    if (!project || project.ownerId !== session.user.id) notFound()

    const t = await getTranslations('projects.location')

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{t('title')}</h1>
                        <p className="text-muted-foreground">{t('description')}</p>
                    </div>
                </div>

                <LocationPicker projectId={project.id} initialLocation={project.locationSettings || undefined} />
            </div>
        </StandardPageShell>
    )
}
