import React from 'react'
import { notFound } from 'next/navigation'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { eq, desc } from 'drizzle-orm'
import {
    Activity,
    CalendarClock,
} from 'lucide-react'
import { db, projects, guests, submissions } from '@/db'
import { getSession } from '@/actions/auth'
import { StandardPageShell } from '@/components/layout/StandardPageShell'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressChecklist, type WorkflowStep } from '@/components/features/ProgressChecklist'
import { Users, ClipboardList, Inbox, PenTool } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

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

    const t = await getTranslations('projects.progress')

    function formatCountdown(date: Date): string {
        const days = daysUntil(date)
        if (days === 0) return t('countdownToday')
        if (days === 1) return t('countdown1Day')
        if (days < 0) return t('countdownDaysAgo', { days: Math.abs(days) })
        return t('countdownDaysToGo', { days })
    }

    const steps: WorkflowStep[] = [
        {
            id: 'setup',
            label: t('stepSetup'),
            description: t('stepSetupDesc'),
            href: 'overview',
            icon: 'LayoutDashboard',
            autoFilled: Boolean(project.honoree && project.name),
            manuallyChecked: checkedIds.includes('setup'),
            stat: project.honoree ? t('statFor', { name: project.honoree }) : undefined,
        },
        {
            id: 'collaborators',
            label: t('stepCollaborators'),
            description: t('stepCollaboratorsDesc'),
            href: 'collaborators',
            icon: 'Users',
            autoFilled: collaboratorCount > 0,
            manuallyChecked: checkedIds.includes('collaborators'),
            stat: collaboratorCount > 0 ? t('statAdded', { count: collaboratorCount }) : undefined,
        },
        {
            id: 'event-date',
            label: t('stepEventDate'),
            description: t('stepEventDateDesc'),
            href: 'overview',
            icon: 'CalendarClock',
            autoFilled: eventDateSet,
            manuallyChecked: checkedIds.includes('event-date'),
            stat: occasionDate ? formatCountdown(occasionDate) : undefined,
        },
        {
            id: 'questionnaire',
            label: t('stepQuestionnaire'),
            description: t('stepQuestionnaireDesc'),
            href: 'questionnaire',
            icon: 'ClipboardList',
            autoFilled: questionCount > 0,
            manuallyChecked: checkedIds.includes('questionnaire'),
            stat: questionCount > 0 ? t('statQuestions', { count: questionCount }) : undefined,
        },
        {
            id: 'submissions',
            label: t('stepSubmissions'),
            description: t('stepSubmissionsDesc'),
            href: 'submissions',
            icon: 'Inbox',
            autoFilled: submissionCount > 0,
            manuallyChecked: checkedIds.includes('submissions'),
            stat: submissionCount > 0 ? t('statReceived', { count: submissionCount }) : undefined,
        },
        {
            id: 'draft',
            label: t('stepDraft'),
            description: t('stepDraftDesc'),
            href: 'editor',
            icon: 'PenTool',
            autoFilled: wordCount > 0,
            manuallyChecked: checkedIds.includes('draft'),
            stat: wordCount > 0 ? t('statWords', { count: wordCount }) : undefined,
        },
    ]

    if (showScheduling) {
        steps.push({
            id: 'scheduling',
            label: t('stepScheduling'),
            description: t('stepSchedulingDesc'),
            href: 'scheduling',
            icon: 'CalendarDays',
            autoFilled: hasDateOptions,
            manuallyChecked: checkedIds.includes('scheduling'),
            stat: hasDateOptions ? t('statDateOptions', { count: project.dateOptions!.length }) : undefined,
        })
    }

    if (isGift) {
        steps.push({
            id: 'location',
            label: t('stepLocation'),
            description: t('stepLocationDesc'),
            href: 'location',
            icon: 'MapPin',
            autoFilled: Boolean(project.locationSettings?.address),
            manuallyChecked: checkedIds.includes('location'),
            stat: project.locationSettings?.name || project.locationSettings?.address,
        })
        steps.push({
            id: 'invites',
            label: t('stepInvites'),
            description: t('stepInvitesDesc'),
            href: 'invites',
            icon: 'Send',
            autoFilled: false,
            manuallyChecked: checkedIds.includes('invites'),
        })
    }

    const completedCount = steps.filter(s => s.manuallyChecked || s.autoFilled).length
    const totalCount = steps.length

    const stats = [
        { label: t('statsCollaborators'), value: collaboratorCount, icon: Users, href: 'collaborators' },
        { label: t('statsQuestions'), value: questionCount, icon: ClipboardList, href: 'questionnaire' },
        { label: t('statsSubmissions'), value: submissionCount, icon: Inbox, href: 'submissions' },
        { label: t('statsWords'), value: wordCount, icon: PenTool, href: 'editor' },
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
                            <h1 className="text-2xl font-bold">{t('title')}</h1>
                            <Badge variant="secondary" className="text-sm font-medium">
                                {t('stepsDone', { completed: completedCount, total: totalCount })}
                            </Badge>
                            {eventDateSet && occasionDate && (
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
                            )}
                        </div>
                        <p className="text-muted-foreground mt-0.5">{t('description')}</p>
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
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t('workflow')}</h2>
                    <ProgressChecklist steps={steps} projectId={projectId} />
                </div>
            </div>
        </StandardPageShell>
    )
}
