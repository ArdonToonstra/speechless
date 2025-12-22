import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ProjectCard } from '@/components/features/ProjectCard'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { User } from '@/payload-types'

export default async function DashboardPage() {
    const payload = await getPayload({ config: configPromise })

    // Need to handle Auth here properly in a real scenario
    // For MVP, we fetch all projects, or if we had user context, filter by it.
    // Since authentication is handled by Payload, we check for the user.
    const { headers } = await import('next/headers')
    const headersList = await headers()
    const user = await payload.auth({ headers: headersList }) as unknown as User | null

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
                    <Button asChild>
                        <Link href="/admin/login">Log In to continue</Link>
                    </Button>
                </div>
            </div>
        )
    }

    const projects = await payload.find({
        collection: 'projects',
        where: {
            owner: {
                equals: user.id
            }
        },
        depth: 1,
    })

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900">Your Speeches</h1>
                        <p className="text-slate-500 mt-2">Welcome back, {user.email}</p>
                    </div>
                    <Button asChild className="rounded-full px-6 bg-indigo-600 hover:bg-indigo-700">
                        <Link href="/onboarding">
                            <Plus className="w-4 h-4 mr-2" />
                            New Project
                        </Link>
                    </Button>
                </div>

                {/* Grid */}
                {projects.docs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.docs.map((project: any) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800 mb-2">No speeches yet</h2>
                        <p className="text-slate-400 mb-6">Ready to write a masterpiece?</p>
                        <Button asChild variant="outline" className="rounded-full">
                            <Link href="/onboarding">Start First Project</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
