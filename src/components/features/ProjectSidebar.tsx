'use client'

import React, { useState, useEffect } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import {
    LayoutDashboard,
    Activity,
    Users,
    ClipboardList,
    Inbox,
    PenTool,
    MapPin,
    Send,
    ChevronLeft,
    ChevronRight,
    Home,
    CalendarDays,
    Heart,
    Menu,
    X
} from 'lucide-react'

interface User {
    id: string
    name: string
    email: string
    image?: string | null
}

interface ProjectSidebarProps {
    projectId: number
    projectTitle: string
    user: User
    occasion: string
    speechType: 'gift' | 'occasion'
    showScheduling: boolean
    hasFeedback: boolean
}

export function ProjectSidebar({ projectId, projectTitle, user, occasion, speechType, showScheduling, hasFeedback }: ProjectSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const pathname = usePathname()
    const t = useTranslations('nav')
    const tCommon = useTranslations('common')

    const navItems = [
        { label: t('overview'), href: 'overview', icon: LayoutDashboard },
        { label: t('progress'), href: 'progress', icon: Activity },
        { label: t('collaborators'), href: 'collaborators', icon: Users },
        { label: t('questionnaire'), href: 'questionnaire', icon: ClipboardList },
        { label: t('submissions'), href: 'submissions', icon: Inbox },
        { label: t('editor'), href: 'editor', icon: PenTool },
        { label: t('scheduling'), href: 'scheduling', icon: CalendarDays },
        { label: t('location'), href: 'location', icon: MapPin },
        { label: t('invites'), href: 'invites', icon: Send },
    ]

    useEffect(() => {
        const stored = localStorage.getItem('sidebar-collapsed')
        if (stored) setIsCollapsed(stored === 'true')
    }, [])

    // Close mobile drawer on route change
    useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname])

    // Lock body scroll when mobile drawer is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isMobileOpen])

    const toggleCollapse = () => {
        const newState = !isCollapsed
        setIsCollapsed(newState)
        localStorage.setItem('sidebar-collapsed', String(newState))
    }

    const getLogo = (occasion: string) => {
        const lower = occasion?.toLowerCase()
        if (lower === 'roast') return '/images/branding/roast-logo.webp'
        if (lower === 'wedding') return '/images/branding/wedding-logo.webp'
        return '/images/branding/base-logo.webp'
    }

    const logoSrc = getLogo(occasion)

    const filteredNavItems = navItems.filter(item => {
        if (speechType === 'occasion' && (item.href === 'location' || item.href === 'invites')) return false
        if (item.href === 'scheduling' && !showScheduling) return false
        return true
    })

    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
        <>
            {/* Header / Logo Area */}
            <div className={cn(
                "h-16 flex items-center border-b border-border shrink-0",
                (isCollapsed && !mobile) ? "justify-center" : "px-4 justify-between"
            )}>
                <Link href="/dashboard" className="flex items-center justify-center font-bold text-lg overflow-hidden whitespace-nowrap flex-1" title={t('backToDashboard')}>
                    {(!isCollapsed || mobile) ? (
                        <div className="relative w-full flex items-center justify-start">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={logoSrc}
                                alt="Toast"
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                    ) : (
                        <Home className="w-5 h-5 text-primary" />
                    )}
                </Link>

                {/* Close button — mobile only */}
                {mobile && (
                    <button
                        type="button"
                        onClick={() => setIsMobileOpen(false)}
                        className="ml-2 shrink-0 h-9 w-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                        aria-label="Close navigation"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Project Context */}
            {(!isCollapsed || mobile) && (
                <div className="px-4 py-3 shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
                    <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1">{t('project')}</p>
                    <p className="font-semibold truncate text-sm" title={projectTitle}>{projectTitle}</p>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
                {filteredNavItems.map((item) => {
                    const isActive = pathname.includes(`/projects/${projectId}/${item.href}`)

                    return (
                        <Button
                            key={item.href}
                            variant={isActive ? "secondary" : "ghost"}
                            className={cn(
                                "w-full justify-start h-11 mb-0.5",
                                (isCollapsed && !mobile) ? "px-0 justify-center" : "px-3 gap-3"
                            )}
                            asChild
                            title={(isCollapsed && !mobile) ? item.label : undefined}
                        >
                            <Link href={`/projects/${projectId}/${item.href}`}>
                                <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
                                {(!isCollapsed || mobile) && <span className="truncate">{item.label}</span>}
                            </Link>
                        </Button>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-2 border-t border-border mt-auto flex flex-col gap-2 shrink-0">

                {/* Feedback link */}
                <Link
                    href="/feedback"
                    title={(isCollapsed && !mobile) ? (hasFeedback ? t('feedbackDone') : t('feedbackPrompt')) : undefined}
                    className={cn(
                        "flex items-center rounded-md transition-colors hover:bg-muted/50 min-h-[44px]",
                        (isCollapsed && !mobile) ? "justify-center w-full px-0 py-2" : "gap-3 px-2 py-2"
                    )}
                >
                    <div className="relative shrink-0">
                        <Heart className={cn("w-4 h-4", hasFeedback ? "text-rose-300" : "text-rose-400")} />
                        {!hasFeedback && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
                        )}
                    </div>
                    {(!isCollapsed || mobile) && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{tCommon('feedback')}</p>
                            <p className="text-xs text-muted-foreground truncate opacity-70">
                                {hasFeedback ? t('feedbackDone') : t('feedbackPrompt')}
                            </p>
                        </div>
                    )}
                </Link>

                {/* User Info */}
                {(!isCollapsed || mobile) && (
                    <Link href="/settings" className="block w-full">
                        <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group min-h-[44px]">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 group-hover:bg-primary/20 transition-colors">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="overflow-hidden text-left">
                                <p className="text-sm font-medium truncate">{user.name || 'User'}</p>
                                <p className="text-xs text-muted-foreground truncate opacity-70">{t('loggedIn')}</p>
                            </div>
                        </div>
                    </Link>
                )}

                {/* Desktop collapse toggle — hidden on mobile */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-full h-9 hover:bg-muted hidden md:flex"
                    onClick={toggleCollapse}
                    title={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
            </div>
        </>
    )

    return (
        <>
            {/* ── Mobile hamburger button ── */}
            <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden fixed top-3 left-3 z-40 h-10 w-10 flex items-center justify-center rounded-lg bg-card border border-border shadow-md text-foreground"
                aria-label="Open navigation"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* ── Mobile backdrop ── */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Mobile drawer ── */}
            <aside
                className={cn(
                    "md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col",
                    "border-r border-border bg-card",
                    "transition-transform duration-300 ease-in-out will-change-transform",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
                aria-hidden={!isMobileOpen}
            >
                <SidebarContent mobile />
            </aside>

            {/* ── Desktop sidebar ── */}
            <aside
                className={cn(
                    "hidden md:flex flex-col",
                    "border-r border-border bg-card transition-all duration-300 ease-in-out",
                    isCollapsed ? "w-16" : "w-64"
                )}
            >
                <SidebarContent />
            </aside>
        </>
    )
}
