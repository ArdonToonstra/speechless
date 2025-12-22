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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 h-full flex flex-col relative overflow-hidden">

                {/* Type Badge */}
                <div className="absolute top-4 right-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        {project.type}
                    </span>
                </div>

                {/* Date / Countdown */}
                <div className="mb-4">
                    <span className={`text-sm font-medium ${isClose ? 'text-amber-500' : 'text-slate-400'}`}>
                        {daysLeft < 0 ? 'Passed' : daysLeft === 0 ? 'Today!' : `${daysLeft} days to go`}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                </h3>

                {/* Status */}
                <div className="mt-auto pt-4 flex items-center text-sm text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-slate-300 mr-2" />
                    {project.status === 'final' ? 'Ready' : 'Drafting'}
                </div>

                {/* Decoration */}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none" />
            </div>
        </Link>
    )
}
