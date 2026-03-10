import React from 'react'
import { db, projects } from '@/db'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import { getDateOptions } from '@/actions/scheduling'
import { DateVotingPublic } from '@/components/features/DateVotingPublic'

export const dynamic = 'force-dynamic'

export default async function PublicSchedulingPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params

    const project = await db.query.projects.findFirst({
        where: eq(projects.shareToken, token),
    })

    if (!project) notFound()

    const options = await getDateOptions(project.id, token)

    if (options.length === 0) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-6">
                <div className="text-center">
                    <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <h1 className="text-xl font-bold mb-2">No dates proposed yet</h1>
                    <p className="text-sm text-muted-foreground">
                        The organizer hasn&apos;t proposed any dates for &quot;{project.name}&quot; yet.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif font-bold mb-2">{project.name}</h1>
                    <p className="text-muted-foreground">
                        Pick the dates that work for you
                    </p>
                </div>

                <DateVotingPublic
                    shareToken={token}
                    projectName={project.name}
                    options={options}
                />
            </div>
        </div>
    )
}
