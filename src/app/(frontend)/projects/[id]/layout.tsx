import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect, notFound } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    Settings,
    Users,
    MessageSquareQuote,
    PenTool,
    MapPin,
    Send,
    ChevronsUpDown,
    Check
} from 'lucide-react'
import { ProjectSwitcher } from '@/components/features/ProjectSwitcher'

// Define the navigation items
const navItems = [
    { label: 'Overview', href: 'overview', icon: LayoutDashboard }, // Was Settings, now Overview. Using LayoutDashboard icon or Settings? User said "Overview".
    { label: 'Collaborators', href: 'collaborators', icon: Users },
    { label: 'Input Gathering', href: 'input', icon: MessageSquareQuote },
    { label: 'Speech Editor', href: 'editor', icon: PenTool },
    { label: 'Location', href: 'location', icon: MapPin },
    { label: 'Send Invites', href: 'invites', icon: Send },
]

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: await (await import('next/headers')).headers() })
    if (!user) return redirect('/login')

    // Fetch current project to show title/contex
    const project = await payload.findByID({
        collection: 'projects',
        id: projectId,
        user,
    })

    if (!project) notFound()

    return (
        <div className="flex h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card flex flex-col">
                <div className="p-4 border-b border-border h-16 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
                        <span className="text-primary">Speechless</span>
                    </Link>
                </div>

                {/* Project Title implementation - simpler without switcher */}
                <div className="p-4 bg-muted/20 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Current Project</p>
                    <p className="font-bold truncate">{project.title}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <Button
                            key={item.href}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 h-10 px-3",
                                // Active state detection would need client component wrapper for usePathname
                                // For now, we rely on checking if child segments match or simple styling
                                // We'll make navigation strict.
                            )}
                            asChild
                        >
                            <Link href={`/projects/${project.id}/${item.href}`}>
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </nav>

                <div className="p-4 border-t border-border mt-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header for Mobile/Context - Optional but good for Breadcrumbs */}
                <header className="h-16 border-b border-border bg-card/50 backdrop-blur px-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center text-sm breadcrumbs text-muted-foreground">
                        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground font-medium">{project.title}</span>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
