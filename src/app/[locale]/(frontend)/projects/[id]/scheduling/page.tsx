import React from 'react'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { CalendarDays } from 'lucide-react'
import { db, projects } from '@/db'
import { getSession } from '@/actions/auth'
import { getDateOptions, getMyDateResponses } from '@/actions/scheduling'
import { DateScheduler } from '@/components/features/DateScheduler'
import { DateVoting } from '@/components/features/DateVoting'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { getTranslations } from 'next-intl/server'

export default async function SchedulingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    if (!session?.user) return redirect('/login')

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: { dateOptions: true }
    })

    if (!project) notFound()

    const hasOptions = project.dateOptions && project.dateOptions.length > 0
    if (project.dateKnown && !hasOptions) {
        redirect(`/projects/${projectId}/overview`)
    }

    const isOwner = project.ownerId === session.user.id
    const options = await getDateOptions(projectId)
    const t = await getTranslations('projects.scheduling')

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarDays className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{t('title')}</h1>
                        <p className="text-muted-foreground">{t('description')}</p>
                    </div>
                </div>

                {isOwner ? (
                    <DateScheduler projectId={project.id} initialOptions={options} />
                ) : (
                    <DateVoting
                        projectId={project.id}
                        projectName={project.name}
                        options={options}
                        userResponses={await getMyDateResponses(project.id)}
                    />
                )}
            </div>
        </StandardPageShell>
    )
}
