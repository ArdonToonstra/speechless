import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ProjectCard } from '@/components/features/ProjectCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { User } from '@/payload-types'
import { logout } from '@/actions/auth'

export default async function DashboardPage() {
    const payload = await getPayload({ config: configPromise })

    // Need to handle Auth here properly in a real scenario
    // For MVP, we fetch all projects, or if we had user context, filter by it.
    // Since authentication is handled by Payload, we check for the user.
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const authResult = await payload.auth({ headers: headersList })
    const user = authResult.user

    if (!user || !user.id || String(user.id) === 'NaN' || Number.isNaN(Number(user.id))) {
        const { redirect } = await import('next/navigation')
        redirect('/admin/login')
    }

    const projects = await payload.find({
        collection: 'projects',
        where: {
            owner: {
                equals: user!.id
            }
        },
        depth: 1,
    })

    return (
        <div className="min-h-screen bg-background p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-foreground">Your Speeches</h1>
                        <p className="text-muted-foreground mt-2">Welcome back, {(user as any)?.name || user?.email}</p>
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
                {projects.docs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.docs.map((project: any) => (
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
