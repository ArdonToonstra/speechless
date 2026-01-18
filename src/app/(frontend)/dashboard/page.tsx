import React from 'react'
import { db, projects, guests } from '@/db'
import { eq, and } from 'drizzle-orm'
import { ProjectCard } from '@/components/features/ProjectCard'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { Plus, Settings, LogOut } from 'lucide-react'
import { logout, getSession } from '@/actions/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// Helper function to get user initials
function getUserInitials(name: string | null, email: string): string {
    if (name) {
        const names = name.trim().split(' ')
        if (names.length >= 2) {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase()
        }
        return name.slice(0, 2).toUpperCase()
    }
    return email.slice(0, 2).toUpperCase()
}

export default async function DashboardPage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    const user = session.user

    // Get projects where user is owner
    const ownedProjects = await db.query.projects.findMany({
        where: eq(projects.ownerId, user.id),
        with: {
            owner: true,
            guests: {
                where: eq(guests.status, 'accepted'),
            },
        },
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
            with: {
                owner: true,
                guests: {
                    where: eq(guests.status, 'accepted'),
                },
            },
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
    
    // Sort by occasionDate (if exists) or createdAt
    allProjects.sort((a, b) => {
        const dateA = a.occasionDate ? new Date(a.occasionDate) : new Date(a.createdAt)
        const dateB = b.occasionDate ? new Date(b.occasionDate) : new Date(b.createdAt)
        return dateA.getTime() - dateB.getTime()
    })
    
    const userInitials = getUserInitials(user.name, user.email)

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground">Your Speeches</h1>
                        <p className="text-muted-foreground mt-2">Welcome back, {user.name || user.email}</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <form action={logout} className="w-full">
                                    <button type="submit" className="flex w-full items-center cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Grid */}
                {allProjects.length > 0 ? (
                    <div className="space-y-4">
                        {allProjects.map((project: any) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                        {/* Create new project card */}
                        <Link 
                            href="/onboarding"
                            className="group block bg-card hover:bg-card rounded-3xl border-2 border-dashed border-border hover:border-primary transition-all p-8"
                        >
                            <div className="flex items-center justify-center gap-4">
                                <div className="rounded-full bg-primary/10 p-3 transition-colors">
                                    <Plus className="w-6 h-6 text-primary transition-colors" />
                                </div>
                                <h3 className="text-lg font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                                    Create New Project
                                </h3>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-card rounded-3xl border border-dashed border-border">
                        <h2 className="text-xl font-semibold text-foreground mb-2">No speeches yet</h2>
                        <p className="text-muted-foreground mb-6">Ready to write a masterpiece?</p>
                        <Button asChild className="rounded-full px-8 bg-primary hover:opacity-90 text-primary-foreground">
                            <Link href="/onboarding">Start First Project</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
