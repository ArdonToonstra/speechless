'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Clock, Check, X, HelpCircle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitDateResponse, type DateOptionWithResponses } from '@/actions/scheduling'
import { toast } from 'sonner'

interface DateVotingProps {
    projectId: number
    projectName: string
    options: DateOptionWithResponses[]
    userResponses: Record<number, { response: string; note: string | null }>
}

export function DateVoting({ projectId, projectName, options, userResponses }: DateVotingProps) {
    return (
        <div className="space-y-3">
            {options.length === 0 ? (
                <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
                    <p className="text-sm text-slate-400">No dates have been proposed yet.</p>
                </div>
            ) : (
                options.map((opt) => (
                    <VotingCard
                        key={opt.id}
                        option={opt}
                        projectId={projectId}
                        initialResponse={userResponses[opt.id]?.response as 'yes' | 'no' | 'maybe' | undefined}
                        initialNote={userResponses[opt.id]?.note || ''}
                    />
                ))
            )}
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
        const previous = response
        setResponse(value)
        setIsSubmitting(true)

        const result = await submitDateResponse(option.id, projectId, value, note)

        setIsSubmitting(false)
        if (!result.success) {
            setResponse(previous) // revert optimistic update
            toast.error(result.error || 'Failed to save response')
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
        <div className={cn(
            "bg-white rounded-xl border overflow-hidden transition-all",
            response === 'yes' ? "border-emerald-200" :
                response === 'no' ? "border-rose-200" :
                    response === 'maybe' ? "border-amber-200" :
                        "border-slate-100"
        )}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
                {/* Date badge */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 shrink-0 text-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                        <div className="bg-slate-50 text-[9px] uppercase font-bold py-0.5 text-slate-400">
                            {format(new Date(option.proposedDate), 'MMM')}
                        </div>
                        <div className="text-xl font-bold py-0.5 text-slate-800">
                            {format(new Date(option.proposedDate), 'd')}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                            {format(new Date(option.proposedDate), 'EEEE')}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            {option.proposedTime && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {option.proposedTime}
                                </span>
                            )}
                            {option.note && (
                                <span className="italic truncate">"{option.note}"</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vote buttons — full-width ≥44px targets on mobile, compact row on desktop */}
                <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-1.5 shrink-0">
                    <Button
                        variant={response === 'yes' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            "h-11 sm:h-8 px-3 rounded-lg text-xs gap-1.5",
                            response === 'yes' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50"
                        )}
                        onClick={() => handleVote('yes')}
                        disabled={isSubmitting}
                    >
                        <Check className="w-3.5 h-3.5" />
                        Yes
                    </Button>
                    <Button
                        variant={response === 'maybe' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            "h-11 sm:h-8 px-3 rounded-lg text-xs gap-1.5",
                            response === 'maybe' ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:text-amber-700 hover:border-amber-200 hover:bg-amber-50"
                        )}
                        onClick={() => handleVote('maybe')}
                        disabled={isSubmitting}
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Maybe
                    </Button>
                    <Button
                        variant={response === 'no' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            "h-11 sm:h-8 px-3 rounded-lg text-xs gap-1.5",
                            response === 'no' ? "bg-rose-600 hover:bg-rose-700 text-white" : "hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50"
                        )}
                        onClick={() => handleVote('no')}
                        disabled={isSubmitting}
                    >
                        <X className="w-3.5 h-3.5" />
                        No
                    </Button>
                </div>
            </div>

            {/* Note section */}
            {response && (
                <div className="px-4 pb-3">
                    {!noteOpen ? (
                        <button
                            onClick={() => setNoteOpen(true)}
                            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 min-h-[44px] sm:min-h-0 py-2 sm:py-0"
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
                                className="h-11 sm:h-8 bg-white border-slate-200 rounded-lg pr-8"
                            />
                            {isSubmitting && (
                                <div className="absolute right-2 top-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
