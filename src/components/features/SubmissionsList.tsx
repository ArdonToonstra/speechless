'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquare, User, Calendar } from 'lucide-react'
import { Submission, Project } from '@/payload-types'
import { format } from 'date-fns'

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
                <p className="text-sm text-muted-foreground">
                    {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
                </p>
            </div>

            <div className="grid gap-4">
                {submissions.map((submission) => (
                    <Card key={submission.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {submission.submitterName?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        {submission.submitterName || 'Anonymous'}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {submission.createdAt
                                                ? format(new Date(submission.createdAt), 'MMM d, yyyy \'at\' h:mm a')
                                                : 'Unknown date'}
                                        </span>
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary" className="ml-2">
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    {submission.answers?.length || 0} answers
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {submission.answers && submission.answers.length > 0 ? (
                                submission.answers.map((answer, index) => (
                                    <div key={index} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            {answer.question}
                                        </p>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {answer.answer}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground italic">No answers provided</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
