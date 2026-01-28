'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronRight, Home, Users, PenTool, MapPin, Send, ChevronUp } from 'lucide-react'
import { useProjectLayout } from '@/components/layout/ProjectLayoutProvider'

interface Project {
    id: number
    occasionType: string
    speechType: 'gift' | 'occasion'
}

interface ProjectHeaderProps {
    project: Project
}

type Step = {
    id: string
    label: string
    href: string
    icon: React.ElementType
    matches: string[]
    disabled?: boolean
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
    const pathname = usePathname()
    const { isHeaderCollapsed, setHeaderCollapsed } = useProjectLayout()

    // Filter out Venue and Share steps for "Speech for the Occasion"
    const isOccasionSpeech = project.speechType === 'occasion'

    const allSteps: Step[] = [
        {
            id: 'overview',
            label: 'Overview',
            href: 'overview',
            icon: Home,
            matches: ['overview', 'settings'], // Overview is the "Home"
        },
        {
            id: 'collaborate',
            label: 'Collaborate',
            href: 'collaborators',
            icon: Users,
            matches: ['collaborators', 'input'],
        },
        {
            id: 'draft',
            label: 'Draft',
            href: 'editor',
            icon: PenTool,
            matches: ['editor'],
        },
        {
            id: 'venue',
            label: 'Venue',
            href: 'location',
            icon: MapPin,
            matches: ['location'],
        },
        {
            id: 'share',
            label: 'Share',
            href: 'invites',
            icon: Send,
            matches: ['invites'],
        },
    ]

    // Filter out Venue and Share for "Speech for the Occasion"
    const steps = isOccasionSpeech
        ? allSteps.filter(step => step.id !== 'venue' && step.id !== 'share')
        : allSteps

    // Find active step index
    const activeStepIndex = steps.findIndex(step =>
        step.matches.some(match => pathname.includes(`/${match}`))
    )

    return (
        <header className={cn(
            "border-b border-border bg-card px-6 flex items-center transition-all duration-300 ease-in-out shrink-0 overflow-hidden",
            isHeaderCollapsed ? "h-0 border-none" : "h-16"
        )}>
            {/* Left Section: Active Step Info */}
            <div className="flex-1 flex items-center gap-2">
                {/* Left empty for spacing the navigation bar */}
            </div>

            {/* Middle Section: Collapse Trigger */}
            <div className="flex-none px-4">
                <button
                    onClick={() => setHeaderCollapsed(true)}
                    className="p-1 hover:bg-muted rounded-md transition-colors text-muted-foreground group"
                    title="Hide Header"
                >
                    <ChevronUp className="w-4 h-4 group-hover:text-foreground" />
                </button>
            </div>

            {/* Right Section: Progress Steps */}
            <div className="flex-1 flex justify-end">
                <div className="flex items-center">
                    {steps.map((step, index) => {
                        const isActive = index === activeStepIndex
                        const isCompleted = index < activeStepIndex
                        const isLast = index === steps.length - 1

                        return (
                            <div key={step.id} className="flex items-center">
                                <Link
                                    href={`/projects/${project.id}/${step.href}`}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm font-medium",
                                        isActive && "bg-primary text-primary-foreground shadow-sm",
                                        isCompleted && !isActive && "text-muted-foreground hover:text-foreground",
                                        !isActive && !isCompleted && "text-muted-foreground/50"
                                    )}
                                >
                                    <span className={cn(
                                        "flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border",
                                        isActive ? "border-transparent bg-white/20" : "border-current",
                                        isCompleted && !isActive && "text-emerald-500 border-emerald-500"
                                    )}>
                                        {isCompleted ? '✓' : index + 1}
                                    </span>
                                    <span className="hidden xl:inline-block whitespace-nowrap">{step.label}</span>
                                </Link>

                                {/* Connector Line */}
                                {!isLast && (
                                    <div className="w-3 h-px bg-border mx-0.5"></div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </header>
    )
}
