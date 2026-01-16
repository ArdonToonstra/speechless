import React from 'react'
import { db, projects, guests } from '@/db'
import { eq, and } from 'drizzle-orm'
import { ProjectCard } from '@/components/features/ProjectCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { logout, getSession } from '@/actions/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    const user = session.user

    // Get projects where user is owner
    const ownedProjects = await db.query.projects.findMany({
        where: eq(projects.ownerId, user.id),
        orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    })

    // Get projects where user is invited as a guest (by email)
    const guestRecords = await db.query.guests.findMany({
        where: and(
            eq(guests.email, user.email),
            eq(guests.status, 'accepted')
        ),
    })

    // Get projects for guest records
    const guestProjectIds = guestRecords.map(g => g.projectId)
    const guestProjects = guestProjectIds.length > 0
        ? await db.query.projects.findMany({
            where: (projects, { inArray }) => inArray(projects.id, guestProjectIds),
        })
        : []

    // Combine and deduplicate projects
    const allProjectsMap = new Map()

    ownedProjects.forEach(project => {
        allProjectsMap.set(project.id, project)
    })

    guestProjects.forEach(project => {
        if (!allProjectsMap.has(project.id)) {
            allProjectsMap.set(project.id, project)
        }
    })

    const allProjects = Array.from(allProjectsMap.values())

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground">Your Speeches</h1>
                        <p className="text-muted-foreground mt-2">Welcome back, {user.name || user.email}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground">
                            <Link href="/settings">Settings</Link>
                        </Button>
                        <form action={logout}>
                            <Button variant="ghost" type="submit" className="rounded-full text-muted-foreground hover:text-foreground">
                                Log Out
                            </Button>
                        </form>
                        <Button asChild className="rounded-full px-6 bg-primary hover:opacity-90">
                            <Link href="/onboarding">
                                <Plus className="w-4 h-4 mr-2" />
                                New Project
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                {allProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allProjects.map((project: any) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                        <h2 className="text-xl font-semibold text-foreground mb-2">No speeches yet</h2>
                        <p className="text-muted-foreground mb-6">Ready to write a masterpiece?</p>
                        <Button asChild variant="outline" className="rounded-full text-foreground border-border">
                            <Link href="/onboarding">Start First Project</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
