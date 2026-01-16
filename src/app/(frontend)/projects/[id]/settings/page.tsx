import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { Settings } from 'lucide-react'
import { db, projects } from '@/db'
import { getSession } from '@/actions/auth'
// We might reuse the Wizard or a simpler form for updating settings
// For now, I'll create a placeholder that reuses the idea of the "Project Settings"
// but strictly for Phase 1: Basics (Title, Type, Date).

export default async function SettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    // Auth check
    const session = await getSession()
    if (!session?.user) return redirect('/login')

    // Fetch Project
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
    })

    if (!project || project.ownerId !== session.user.id) notFound()

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-3 pb-6 border-b">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Speech Settings</h1>
                    <p className="text-muted-foreground">Manage the basic details of your speech.</p>
                </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
                <p>Form to update Title, Date, Type coming here. (Currently in Onboarding)</p>
                {/* 
                   TODO: Refactor Onboarding form to be reusable here or create new one.
                   Currently keeping it simple to focus on structure.
                */}
                <div className="space-y-2 mt-4">
                    <p><strong>Title:</strong> {project.name}</p>
                    <p><strong>Type:</strong> {project.occasionType}</p>
                    <p><strong>Date:</strong> {project.occasionDate ? new Date(project.occasionDate).toLocaleDateString() : 'Not set'}</p>
                </div>
            </div>
        </div>
    )
}
