'use client'

import React from 'react'
import { Project } from '@/payload-types'
import Link from 'next/link'
import { formatDistance, differenceInDays } from 'date-fns'

interface ProjectCardProps {
    project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
    const eventDate = new Date(project.date)
    const daysLeft = differenceInDays(eventDate, new Date())

    // Format based on proximity
    const timeString = formatDistance(eventDate, new Date(), { addSuffix: true })
    const isClose = daysLeft <= 7 && daysLeft >= 0

    return (
        <Link
            href={`/editor/${project.id}`}
            className="block group"
        >
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 h-full flex flex-col relative overflow-hidden">

                {/* Type Badge */}
                <div className="absolute top-4 right-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-muted/10 px-3 py-1 rounded-full border border-border/50">
                        {project.type}
                    </span>
                </div>

                {/* Date / Countdown */}
                <div className="mb-4">
                    <span className={`text-sm font-medium ${isClose ? 'text-celebration' : 'text-muted-foreground'}`}>
                        {daysLeft < 0 ? 'Passed' : daysLeft === 0 ? 'Today!' : `${daysLeft} days to go`}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                </h3>

                {/* Status */}
                <div className="mt-auto pt-4 flex items-center text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-border mr-2" />
                    {project.status === 'final' ? 'Ready' : 'Drafting'}
                </div>

                {/* Decoration */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none" />
            </div>
        </Link>
    )
}
