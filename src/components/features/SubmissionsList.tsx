'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, User, Calendar } from 'lucide-react'
import { format } from 'date-fns'

interface AnswerItem {
    question: string
    answer: string
}

interface Submission {
    id: number
    submitterName: string
    answers: AnswerItem[] | null
    createdAt: Date | null
}

interface Project {
    id: number
    name: string
}

interface SubmissionsListProps {
    submissions: Submission[]
    project: Project
}

export function SubmissionsList({ submissions, project }: SubmissionsListProps) {
    if (submissions.length === 0) {
        return (
            <div className="bg-muted/30 border border-dashed rounded-lg p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground">
                    Share the questionnaire link with your guests to start collecting stories and memories!
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 font-medium">
                    {submissions.length} submission{submissions.length !== 1 ? 's' : ''} received
                </p>
            </div>

            <div className="grid gap-6">
                {submissions.map((submission) => (
                    <Card key={submission.id} className="border-none shadow-sm rounded-2xl bg-white overflow-hidden hover:shadow-md transition-all">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {submission.submitterName?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-semibold text-slate-900">
                                                {submission.submitterName || 'Anonymous'}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {submission.createdAt
                                                        ? format(new Date(submission.createdAt), 'MMM d, yyyy \'at\' h:mm a')
                                                        : 'Unknown date'}
                                                </span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-700 shadow-sm">
                                    <MessageSquare className="w-3 h-3 mr-1.5 text-slate-400" />
                                    {submission.answers?.length || 0} answers
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            {submission.answers && submission.answers.length > 0 ? (
                                submission.answers.map((answer, index) => (
                                    <div key={index} className="space-y-2 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                                        <p className="text-sm font-semibold text-slate-700">
                                            {answer.question}
                                        </p>
                                        <div className="text-sm leading-relaxed whitespace-pre-wrap text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            {answer.answer}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic text-center py-4">No answers provided</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
