'use client'

import React from 'react'
import { MessageSquare, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { CommentThread, type CommentData } from './CommentThread'

interface AnswerItem {
    question: string
    answer: string
}

interface Submission {
    id: number
    submitterName: string
    answers: AnswerItem[] | null
    createdAt: Date | null
    comments: CommentData[]
}

interface Project {
    id: number
    name: string
}

interface SubmissionsListProps {
    submissions: Submission[]
    project: Project
    projectId: number
    authorName: string
}

export function SubmissionsList({ submissions, project, projectId, authorName }: SubmissionsListProps) {
    if (submissions.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                <h3 className="text-sm font-medium text-slate-500 mb-1">No submissions yet</h3>
                <p className="text-xs text-slate-400">
                    Share the questionnaire link with your guests to start collecting stories and memories!
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {submissions.map((submission) => (
                <div key={submission.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-medium shrink-0">
                            {submission.submitterName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-slate-900">
                                {submission.submitterName || 'Anonymous'}
                            </span>
                            <span className="text-xs text-slate-400 ml-2">
                                {submission.createdAt
                                    ? format(new Date(submission.createdAt), 'MMM d, yyyy')
                                    : ''}
                            </span>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">
                            {submission.answers?.length || 0} answers
                        </span>
                    </div>

                    {/* Answers */}
                    <div className="px-4 py-3 space-y-3">
                        {submission.answers && submission.answers.length > 0 ? (
                            submission.answers.map((answer, index) => (
                                <div key={index} className="space-y-1 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                    <p className="text-xs font-medium text-slate-500">
                                        {answer.question}
                                    </p>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {answer.answer}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 italic text-center py-2">No answers provided</p>
                        )}
                    </div>

                    <CommentThread
                        submissionId={submission.id}
                        projectId={projectId}
                        authorName={authorName}
                        initialComments={submission.comments}
                    />
                </div>
            ))}
        </div>
    )
}
