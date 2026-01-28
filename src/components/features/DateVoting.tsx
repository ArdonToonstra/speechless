'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock, Check, X, HelpCircle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { submitDateResponse, type DateOptionWithResponses } from '@/actions/scheduling'
import { toast } from 'sonner'

interface DateVotingProps {
    projectId: number
    projectName: string
    options: DateOptionWithResponses[]
    userResponses: Record<number, { response: string; note: string | null }>
}

export function DateVoting({ projectId, projectName, options, userResponses }: DateVotingProps) {
    // Sort options by date
    const sortedOptions = [...options].sort((a, b) =>
        new Date(a.proposedDate).getTime() - new Date(b.proposedDate).getTime()
    )

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-2">Availability for {projectName}</h2>
                <p className="text-muted-foreground">
                    Please indicate which dates work for you.
                </p>
            </div>

            <div className="space-y-4">
                {sortedOptions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                        No dates have been proposed yet.
                    </div>
                ) : (
                    sortedOptions.map((opt) => (
                        <VotingCard
                            key={opt.id}
                            option={opt}
                            projectId={projectId}
                            initialResponse={userResponses[opt.id]?.response as any}
                            initialNote={userResponses[opt.id]?.note || ''}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

function VotingCard({
    option,
    projectId,
    initialResponse,
    initialNote
}: {
    option: DateOptionWithResponses,
    projectId: number,
    initialResponse?: 'yes' | 'no' | 'maybe',
    initialNote?: string
}) {
    const [response, setResponse] = useState<'yes' | 'no' | 'maybe' | undefined>(initialResponse)
    const [note, setNote] = useState(initialNote || '')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [noteOpen, setNoteOpen] = useState(!!initialNote)

    const handleVote = async (value: 'yes' | 'no' | 'maybe') => {
        setResponse(value)
        setIsSubmitting(true)

        const result = await submitDateResponse(option.id, projectId, value, note)

        setIsSubmitting(false)
        if (!result.success) {
            toast.error(result.error || 'Failed to save response')
            // Revert state on failure if needed, but keeping optimistic here for better feel
        } else {
            // Optional: toast.success('Saved') - might be too spammy if voting on multiple
        }
    }

    const handleNoteSave = async () => {
        if (!response) return

        setIsSubmitting(true)
        const result = await submitDateResponse(option.id, projectId, response, note)
        setIsSubmitting(false)

        if (result.success) {
            toast.success('Note saved')
        } else {
            toast.error('Failed to save note')
        }
    }

    return (
        <Card className={cn(
            "transition-all border-l-4",
            response === 'yes' ? "border-l-emerald-500 bg-emerald-50/10" :
                response === 'no' ? "border-l-rose-500 bg-rose-50/10" :
                    response === 'maybe' ? "border-l-amber-500 bg-amber-50/10" :
                        "border-l-transparent"
        )}>
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Date Info */}
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-16 text-center border rounded-lg bg-white overflow-hidden shadow-sm">
                            <div className="bg-slate-100 text-xs uppercase font-bold py-1 text-slate-500">
                                {format(new Date(option.proposedDate), 'MMM')}
                            </div>
                            <div className="text-2xl font-bold py-1 text-slate-800">
                                {format(new Date(option.proposedDate), 'd')}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-slate-900">
                                {format(new Date(option.proposedDate), 'EEEE')}
                            </h3>
                            <div className="text-sm text-slate-500 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                                {option.proposedTime && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {option.proposedTime}
                                    </span>
                                )}
                                {option.note && (
                                    <span className="text-slate-500 italic">
                                        "{option.note}"
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Voting Actions */}
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <div className="flex items-center gap-2">
                            <Button
                                variant={response === 'yes' ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    "flex-1 gap-2",
                                    response === 'yes' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50"
                                )}
                                onClick={() => handleVote('yes')}
                                disabled={isSubmitting}
                            >
                                <Check className="w-4 h-4" />
                                Yes
                            </Button>
                            <Button
                                variant={response === 'maybe' ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    "flex-1 gap-2",
                                    response === 'maybe' ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:text-amber-700 hover:border-amber-200 hover:bg-amber-50"
                                )}
                                onClick={() => handleVote('maybe')}
                                disabled={isSubmitting}
                            >
                                <HelpCircle className="w-4 h-4" />
                                Maybe
                            </Button>
                            <Button
                                variant={response === 'no' ? 'default' : 'outline'}
                                size="sm"
                                className={cn(
                                    "flex-1 gap-2",
                                    response === 'no' ? "bg-rose-600 hover:bg-rose-700 text-white" : "hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50"
                                )}
                                onClick={() => handleVote('no')}
                                disabled={isSubmitting}
                            >
                                <X className="w-4 h-4" />
                                No
                            </Button>
                        </div>

                        {/* Note Toggle/Input */}
                        {response && (
                            <div className="animate-in fade-in slide-in-from-top-1">
                                {!noteOpen ? (
                                    <button
                                        onClick={() => setNoteOpen(true)}
                                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-1"
                                    >
                                        <MessageSquare className="w-3 h-3" />
                                        add a note...
                                    </button>
                                ) : (
                                    <div className="relative">
                                        <Input
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            onBlur={handleNoteSave}
                                            onKeyDown={(e) => e.key === 'Enter' && handleNoteSave()}
                                            placeholder="Add a note (optional)"
                                            className="text-sm h-8 pr-8"
                                        />
                                        <div className="absolute right-2 top-2">
                                            {isSubmitting && <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
