'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    LayoutDashboard,
    Users,
    MessageSquareQuote,
    PenTool,
    MapPin,
    Send,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Home
} from 'lucide-react'
import { User } from '@/payload-types'

// Define the navigation items
const navItems = [
    { label: 'Overview', href: 'overview', icon: LayoutDashboard },
    { label: 'Collaborators', href: 'collaborators', icon: Users },
    { label: 'Input Gathering', href: 'input', icon: MessageSquareQuote },
    { label: 'Speech Editor', href: 'editor', icon: PenTool },
    { label: 'Location', href: 'location', icon: MapPin },
    { label: 'Send Invites', href: 'invites', icon: Send },
]

interface ProjectSidebarProps {
    projectId: number
    projectTitle: string
    user: User
}

export function ProjectSidebar({ projectId, projectTitle, user }: ProjectSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const pathname = usePathname()

    // Optional: Persist collapse state
    useEffect(() => {
        const stored = localStorage.getItem('sidebar-collapsed')
        if (stored) setIsCollapsed(stored === 'true')
    }, [])

    const toggleCollapse = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        localStorage.setItem('sidebar-collapsed', String(newState))
    }

    return (
        <aside
            className={cn(
                "border-r border-border bg-card flex flex-col transition-all duration-300 ease-in-out",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header / Logo Area */}
            <div className={cn(
                "h-16 flex items-center border-b border-border",
                isCollapsed ? "justify-center" : "px-4 justify-between"
            )}>
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg overflow-hidden whitespace-nowrap" title="Back to Dashboard">
                    {!isCollapsed ? (
                        <span className="text-primary truncate">Speechless</span>
                    ) : (
                        <Home className="w-5 h-5 text-primary" />
                    )}
                </Link>
            </div>

            {/* Project Context (Only visible when expanded) */}
            {!isCollapsed && (
                <div className="p-4 bg-muted/20 border-b border-border animate-in fade-in slide-in-from-left-2 duration-300">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Project</p>
                    <p className="font-bold truncate" title={projectTitle}>{projectTitle}</p>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => {
                    const isActive = pathname.includes(`/projects/${projectId}/${item.href}`)

                    return (
                        <Button
                            key={item.href}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start h-10 mb-1",
                                isCollapsed ? "px-0 justify-center" : "px-3 gap-3"
                            )}
                            asChild
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Link href={`/projects/${projectId}/${item.href}`}>
                                <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
                                {!isCollapsed && <span className="truncate">{item.label}</span>}
                            </Link>
                        </Button>
                    )
                })}
            </nav>

            {/* Footer / Toggle */}
            <div className="p-2 border-t border-border mt-auto flex flex-col gap-2">

                {/* User Info (Only expanded) */}
                {!isCollapsed && (
                    <Link href="/settings" className="block w-full">
                        <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 group-hover:bg-primary/20 transition-colors">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="overflow-hidden text-left">
                                <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                                <p className="text-xs text-muted-foreground truncate opacity-70">Logged in</p>
                            </div>
                        </div>
                    </Link>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-8 hover:bg-muted"
                    onClick={toggleCollapse}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
            </div>
        </aside>
    )
}
