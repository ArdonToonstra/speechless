import React from 'react'
import { notFound, redirect } from 'next/navigation'
import { eq, desc } from 'drizzle-orm'
import {
    Activity,
    CalendarClock,
} from 'lucide-react'
import Link from 'next/link'
import { db, projects, guests, submissions } from '@/db'
import { getSession } from '@/actions/auth'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressChecklist, type WorkflowStep } from '@/components/features/ProgressChecklist'
import { Users, ClipboardList, Inbox, PenTool } from 'lucide-react'

// Recursively extract word count from Tiptap JSONContent
function countWords(json: unknown): number {
    if (!json || typeof json !== 'object') return 0
    const node = json as { text?: string; content?: unknown[] }
    let count = 0
    if (node.text) {
        count += node.text.trim().split(/\s+/).filter(Boolean).length
    }
    if (Array.isArray(node.content)) {
        for (const child of node.content) {
            count += countWords(child)
        }
    }
    return count
}

function daysUntil(date: Date): number {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

function formatCountdown(date: Date): string {
    const days = daysUntil(date)
    if (days === 0) return 'Today!'
    if (days === 1) return '1 day to go'
    if (days < 0) return `${Math.abs(days)} days ago`
    return `${days} days to go`
}

export default async function ProgressPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) notFound()

    const session = await getSession()
    if (!session?.user) return redirect('/login')

    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: { dateOptions: true },
    })

    if (!project || project.ownerId !== session.user.id) notFound()

    const [collaboratorRows, submissionRows] = await Promise.all([
        db.query.guests.findMany({ where: eq(guests.projectId, projectId) }),
        db.query.submissions.findMany({
            where: eq(submissions.projectId, projectId),
            orderBy: [desc(submissions.createdAt)],
        }),
    ])

    const collaboratorCount = collaboratorRows.length
    const submissionCount = submissionRows.length
    const questionCount = (project.questions || []).length
    const wordCount = countWords(project.draft)
    const isGift = project.speechType === 'gift'
    const hasDateOptions = (project.dateOptions || []).length > 0
    const showScheduling = !project.dateKnown || hasDateOptions
    const checkedIds = (project.progressChecks || []) as string[]

    const eventDateSet = project.dateKnown && !!project.occasionDate
    const occasionDate = project.occasionDate ? new Date(project.occasionDate) : null

    const steps: WorkflowStep[] = [
        {
            id: 'setup',
            label: 'Project Setup',
            description: 'Fill in the speech title, occasion type, event date, and who the speech is for.',
            href: 'overview',
            icon: 'LayoutDashboard',
            autoFilled: Boolean(project.honoree && project.name),
            manuallyChecked: checkedIds.includes('setup'),
            stat: project.honoree ? `For ${project.honoree}` : undefined,
        },
        {
            id: 'collaborators',
            label: 'Invite Collaborators',
            description: 'Add friends, family, or colleagues who can contribute stories and memories.',
            href: 'collaborators',
            icon: 'Users',
            autoFilled: collaboratorCount > 0,
            manuallyChecked: checkedIds.includes('collaborators'),
            stat: collaboratorCount > 0 ? `${collaboratorCount} added` : undefined,
        },
        {
            id: 'event-date',
            label: 'Set Event Date',
            description: 'Set the date of the occasion so you can track how much time you have left.',
            href: 'overview',
            icon: 'CalendarClock',
            autoFilled: eventDateSet,
            manuallyChecked: checkedIds.includes('event-date'),
            stat: occasionDate ? formatCountdown(occasionDate) : undefined,
        },
        {
            id: 'questionnaire',
            label: 'Create Questionnaire',
            description: 'Write the questions your collaborators will answer, then share the link with them.',
            href: 'questionnaire',
            icon: 'ClipboardList',
            autoFilled: questionCount > 0,
            manuallyChecked: checkedIds.includes('questionnaire'),
            stat: questionCount > 0 ? `${questionCount} questions` : undefined,
        },
        {
            id: 'submissions',
            label: 'Collect Submissions',
            description: 'Wait for collaborators to submit their answers through the questionnaire link.',
            href: 'submissions',
            icon: 'Inbox',
            autoFilled: submissionCount > 0,
            manuallyChecked: checkedIds.includes('submissions'),
            stat: submissionCount > 0 ? `${submissionCount} received` : undefined,
        },
        {
            id: 'draft',
            label: 'Write Your Speech',
            description: 'Use the collected stories and memories to draft your speech in the editor.',
            href: 'editor',
            icon: 'PenTool',
            autoFilled: wordCount > 0,
            manuallyChecked: checkedIds.includes('draft'),
            stat: wordCount > 0 ? `${wordCount} words` : undefined,
        },
    ]

    if (showScheduling) {
        steps.push({
            id: 'scheduling',
            label: 'Schedule the Event',
            description: 'Propose date options and let collaborators vote on the best time.',
            href: 'scheduling',
            icon: 'CalendarDays',
            autoFilled: hasDateOptions,
            manuallyChecked: checkedIds.includes('scheduling'),
            stat: hasDateOptions ? `${project.dateOptions!.length} date options` : undefined,
        })
    }

    if (isGift) {
        steps.push({
            id: 'location',
            label: 'Set the Location',
            description: 'Choose or confirm the venue for the event.',
            href: 'location',
            icon: 'MapPin',
            autoFilled: Boolean(project.locationSettings?.address),
            manuallyChecked: checkedIds.includes('location'),
            stat: project.locationSettings?.name || project.locationSettings?.address,
        })
        steps.push({
            id: 'invites',
            label: 'Send Invites',
            description: 'Send personalised invitations to all your guests for the event.',
            href: 'invites',
            icon: 'Send',
            autoFilled: false,
            manuallyChecked: checkedIds.includes('invites'),
        })
    }

    const completedCount = steps.filter(s => s.manuallyChecked || s.autoFilled).length
    const totalCount = steps.length

    const stats = [
        { label: 'Collaborators', value: collaboratorCount, icon: Users, href: 'collaborators' },
        { label: 'Questions', value: questionCount, icon: ClipboardList, href: 'questionnaire' },
        { label: 'Submissions', value: submissionCount, icon: Inbox, href: 'submissions' },
        { label: 'Words written', value: wordCount, icon: PenTool, href: 'editor' },
    ]

    return (
        <StandardPageShell>
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Page header */}
                <div className="flex items-start gap-3 pb-6 border-b">
                    <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                        <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold">Progress</h1>
                            <Badge variant="secondary" className="text-sm font-medium">
                                {completedCount} / {totalCount} steps done
                            </Badge>
                            {/* Countdown badge */}
                            {eventDateSet && occasionDate ? (
                                <Badge
                                    className={
                                        daysUntil(occasionDate) <= 7
                                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    }
                                    variant="outline"
                                >
                                    <CalendarClock className="w-3 h-3 mr-1" />
                                    {formatCountdown(occasionDate)}
                                </Badge>
                            ) : (
                                <Link
                                    href={`/projects/${projectId}/overview`}
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                                >
                                    Set event date →
                                </Link>
                            )}
                        </div>
                        <p className="text-muted-foreground mt-0.5">Track your speech-writing journey</p>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {stats.map(stat => (
                        <Link key={stat.label} href={`/projects/${projectId}/${stat.href}`}>
                            <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                                <CardContent className="pt-5 pb-4 px-5">
                                    <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                                        <stat.icon className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium uppercase tracking-wide">{stat.label}</span>
                                    </div>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Workflow checklist */}
                <div>
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Workflow</h2>
                    <ProgressChecklist steps={steps} projectId={projectId} />
                </div>
            </div>
        </StandardPageShell>
    )
}
