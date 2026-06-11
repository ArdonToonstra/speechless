import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'
import { getSession } from '@/actions/auth'
import { getProjectForMember } from '@/lib/permissions'
import { ProjectOverview } from '@/components/features/ProjectOverview'
import { ShareDialog } from '@/components/features/ShareDialog'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { getLocale, getTranslations } from 'next-intl/server'

export default async function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    const locale = await getLocale()
    if (!session?.user) return redirect(`/${locale}/login`)

    const project = await getProjectForMember(projectId, session.user.id, session.user.email)
    if (!project) notFound()

    const t = await getTranslations('projects.overview')
    const isOwner = project.ownerId === session.user.id

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold">{t('title')}</h1>
                        <p className="text-muted-foreground">{t('description')}</p>
                    </div>
                    {isOwner && (
                        <ShareDialog
                            projectId={projectId.toString()}
                            initialToken={project.shareToken}
                            initialEnabled={project.isPubliclyShared}
                        />
                    )}
                </div>

                <ProjectOverview project={project as any} />
            </div>
        </StandardPageShell>
    )
}
