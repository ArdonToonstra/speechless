'use client'

import React from 'react'
import Link from 'next/link'

interface Project {
    id: number
    name: string
    speechType: string
    occasionDate: Date | null
    occasionType: string
    customOccasion?: string | null
    dateKnown: boolean
    honoree?: string | null
    eventContext?: string | null
    city?: string | null
    guestCount?: number | null
    status: string
    createdAt: Date
    updatedAt: Date
    owner?: {
        id: string
        name: string
        email: string
    }
    guests?: Array<{
        id: number
        name: string | null
        email: string
        status: string
    }>
}
import { format, formatDistance, differenceInDays } from 'date-fns'

interface ProjectCardProps {
    project: Project
}

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

// Generate color based on string (consistent colors for same user)
function getColorForUser(identifier: string): string {
    const colors = [
        'bg-amber-200 text-amber-800 border-amber-300',
        'bg-emerald-200 text-emerald-800 border-emerald-300',
        'bg-blue-200 text-blue-800 border-blue-300',
        'bg-purple-200 text-purple-800 border-purple-300',
        'bg-pink-200 text-pink-800 border-pink-300',
        'bg-indigo-200 text-indigo-800 border-indigo-300',
        'bg-cyan-200 text-cyan-800 border-cyan-300',
        'bg-rose-200 text-rose-800 border-rose-300',
    ]
    const hash = identifier.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
}

export function ProjectCard({ project }: ProjectCardProps) {
    const eventDate = project.occasionDate ? new Date(project.occasionDate) : null
    const daysLeft = eventDate ? differenceInDays(eventDate, new Date()) : null

    // Format date nicely
    const dateDisplay = !project.dateKnown
        ? 'Date TBD'
        : eventDate 
            ? daysLeft !== null && daysLeft >= 0 && daysLeft <= 30
                ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} away`
                : format(eventDate, 'MMM d, yyyy')
            : 'No date set'
    
    // Format occasion display
    const occasionDisplay = project.occasionType === 'other' && project.customOccasion
        ? project.customOccasion
        : project.occasionType
            ? project.occasionType.charAt(0).toUpperCase() + project.occasionType.slice(1)
            : 'Speech'

    const isUpcoming = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7
    const lastEdited = formatDistance(new Date(project.updatedAt), new Date(), { addSuffix: true })

    // Prepare collaborators list (owner first, then guests)
    const collaborators = []
    if (project.owner) {
        collaborators.push({
            initials: getUserInitials(project.owner.name, project.owner.email),
            color: getColorForUser(project.owner.email),
            name: project.owner.name || project.owner.email,
        })
    }
    if (project.guests) {
        project.guests.forEach(guest => {
            collaborators.push({
                initials: getUserInitials(guest.name, guest.email),
                color: getColorForUser(guest.email),
                name: guest.name || guest.email,
            })
        })
    }

    const displayedCollaborators = collaborators.slice(0, 4)
    const remainingCount = collaborators.length - 4

    return (
        <Link
            href={`/projects/${project.id}`}
            className="block group"
        >
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden transform transition-all hover:scale-[1.01] hover:shadow-xl hover:border-primary/30 flex flex-col md:flex-row">
                {/* Left Side - Main Info */}
                <div className="flex-1 p-6 md:p-8 text-left space-y-6">
                    <div>
                        <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                            {occasionDisplay}
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
                            {project.name}
                        </h3>
                        {project.honoree && (
                            <p className="text-sm text-foreground/80 mt-1">For {project.honoree}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">Last edited {lastEdited}</p>
                    </div>

                    <div className="space-y-3">
                        <div className="text-xs font-semibold text-muted-foreground uppercase">Event Date</div>
                        <div className={`text-lg font-semibold ${isUpcoming ? 'text-primary' : 'text-foreground'}`}>
                            {dateDisplay}
                            {isUpcoming && daysLeft !== null && (
                                <span className="ml-2 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    Coming Soon!
                                </span>
                            )}
                        </div>
                    </div>

                    {collaborators.length > 0 && (
                        <div className="space-y-3">
                            <div className="text-xs font-semibold text-muted-foreground uppercase">Collaborators</div>
                            <div className="flex -space-x-3">
                                {displayedCollaborators.map((collab, idx) => (
                                    <div 
                                        key={idx}
                                        className={`w-10 h-10 rounded-full border-2 border-card flex items-center justify-center text-xs font-bold ${collab.color}`}
                                        title={collab.name}
                                    >
                                        {collab.initials}
                                    </div>
                                ))}
                                {remainingCount > 0 && (
                                    <div className="w-10 h-10 rounded-full border-2 border-card bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">
                                        +{remainingCount}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side - Status */}
                <div className="w-full md:w-56 bg-muted/10 border-t md:border-t-0 md:border-l border-border/50 p-6 text-left space-y-4">
                    <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">Status</div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                        project.status === 'final'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${
                            project.status === 'final' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}></span>
                        {project.status === 'final' ? 'Ready' : 'Drafting Phase'}
                    </div>

                    <div className="pt-4 space-y-2">
                        <div className="text-xs text-muted-foreground">
                            <span className="font-semibold uppercase">Type:</span>
                            <div className="mt-1 text-foreground capitalize">{project.speechType === 'gift' ? 'Gift' : 'Occasion'}</div>
                        </div>
                        {project.city && (
                            <div className="text-xs text-muted-foreground">
                                <span className="font-semibold uppercase">Location:</span>
                                <div className="mt-1 text-foreground">{project.city}</div>
                            </div>
                        )}
                        {project.guestCount && (
                            <div className="text-xs text-muted-foreground">
                                <span className="font-semibold uppercase">Guests:</span>
                                <div className="mt-1 text-foreground">~{project.guestCount}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    )
}
