import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { Settings } from 'lucide-react'
import { getSession } from '@/actions/auth'
import { getProjectForMember } from '@/lib/permissions'
import { getLocale, getTranslations } from 'next-intl/server'

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    const locale = await getLocale()
    if (!session?.user) return redirect(`/${locale}/login`)

    const project = await getProjectForMember(projectId, session.user.id, session.user.email)
    if (!project) notFound()

    const t = await getTranslations('projects.projectSettings')

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('description')}</p>
                </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
                <div className="space-y-2 mt-4">
                    <p><strong>{t('titleLabel')}</strong> {project.name}</p>
                    <p><strong>{t('typeLabel')}</strong> {project.occasionType}</p>
                    <p><strong>{t('dateLabel')}</strong> {project.occasionDate ? new Date(project.occasionDate).toLocaleDateString() : t('notSet')}</p>
                </div>
            </div>
        </div>
    )
}
