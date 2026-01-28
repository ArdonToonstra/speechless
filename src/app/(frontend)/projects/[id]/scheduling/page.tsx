import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { CalendarDays } from 'lucide-react'
import { db, projects, dateOptions } from '@/db'
import { getSession } from '@/actions/auth'
import { getDateOptions, getMyDateResponses } from '@/actions/scheduling'
import { DateScheduler } from '@/components/features/DateScheduler'
import { DateVoting } from '@/components/features/DateVoting'
import { StandardPageShell } from '@/components/layout/StandardPageShell'

export default async function SchedulingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    // Auth check
    const session = await getSession()
    if (!session?.user) return redirect('/login')

    // Fetch Project
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
            dateOptions: true
        }
    })

    if (!project) notFound()

    // Visibility Check
    const hasOptions = project.dateOptions && project.dateOptions.length > 0
    if (project.dateKnown && !hasOptions) {
        // Feature disabled for this project
        redirect(`/projects/${projectId}/overview`)
    }

    // Determine View (Owner vs Collaborator)
    const isOwner = project.ownerId === session.user.id

    // Fetch data
    const options = await getDateOptions(projectId)

    return (
        <StandardPageShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarDays className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Scheduling & Availability</h1>
                        <p className="text-muted-foreground">Find the best date for the event.</p>
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
