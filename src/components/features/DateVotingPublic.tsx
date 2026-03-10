'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Clock, Check, X, HelpCircle, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { submitDateResponseAnonymous, type DateOptionWithResponses } from '@/actions/scheduling'
import { toast } from 'sonner'

interface DateVotingPublicProps {
    shareToken: string
    projectName: string
    options: DateOptionWithResponses[]
}

export function DateVotingPublic({ shareToken, projectName, options }: DateVotingPublicProps) {
    const [guestName, setGuestName] = useState('')
    const [started, setStarted] = useState(false)
    const [guestId, setGuestId] = useState<number | null>(null)
    const [responses, setResponses] = useState<Record<number, 'yes' | 'no' | 'maybe'>>({})
    const [isSubmitted, setIsSubmitted] = useState(false)

    if (isSubmitted) {
        return (
            <div className="bg-white rounded-xl border border-slate-100 p-10 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold mb-1">Thanks, {guestName}!</h2>
                <p className="text-sm text-slate-500">Your availability has been recorded.</p>
            </div>
        )
    }

    if (!started) {
        return (
            <div className="bg-white rounded-xl border border-slate-100 p-6 space-y-4">
                <div className="space-y-1.5">
                    <label className="text-xs text-slate-500">Your name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <Input
                            placeholder="Enter your name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && guestName.trim() && setStarted(true)}
                            className="pl-9 h-9 text-sm bg-white border-slate-200 rounded-lg"
                        />
                    </div>
                </div>
                <Button
                    onClick={() => setStarted(true)}
                    disabled={!guestName.trim()}
                    size="sm"
                    className="w-full h-9 rounded-lg"
                >
                    Continue
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <p className="text-xs text-slate-400 text-center">
                Voting as <span className="font-medium text-slate-600">{guestName}</span>
            </p>
            {options.map((opt) => (
                <VotingCardPublic
                    key={opt.id}
                    option={opt}
                    shareToken={shareToken}
                    guestName={guestName}
                    guestId={guestId}
                    onGuestId={setGuestId}
                    currentResponse={responses[opt.id]}
                    onResponse={(r) => setResponses(prev => ({ ...prev, [opt.id]: r }))}
                />
            ))}
            {Object.keys(responses).length === options.length && (
                <div className="pt-2">
                    <Button
                        onClick={() => setIsSubmitted(true)}
                        size="sm"
                        className="w-full h-9 rounded-lg"
                    >
                        Done
                    </Button>
                </div>
            )}
        </div>
    )
}

function VotingCardPublic({
    option,
    shareToken,
    guestName,
    guestId,
    onGuestId,
    currentResponse,
    onResponse,
}: {
    option: DateOptionWithResponses
    shareToken: string
    guestName: string
    guestId: number | null
    onGuestId: (id: number) => void
    currentResponse?: 'yes' | 'no' | 'maybe'
    onResponse: (r: 'yes' | 'no' | 'maybe') => void
}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [note, setNote] = useState('')
    const [noteOpen, setNoteOpen] = useState(false)

    const handleVote = async (value: 'yes' | 'no' | 'maybe') => {
        onResponse(value)
        setIsSubmitting(true)

        const result = await submitDateResponseAnonymous(shareToken, guestName, option.id, value, note)

        setIsSubmitting(false)
        if (result.success) {
            if (result.guestId) onGuestId(result.guestId)
        } else {
            toast.error(result.error || 'Failed to save response')
        }
    }

    const handleNoteSave = async () => {
        if (!currentResponse) return
        setIsSubmitting(true)
        const result = await submitDateResponseAnonymous(shareToken, guestName, option.id, currentResponse, note)
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
            currentResponse === 'yes' ? "border-emerald-200" :
                currentResponse === 'no' ? "border-rose-200" :
                    currentResponse === 'maybe' ? "border-amber-200" :
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
                                <span className="italic truncate">&quot;{option.note}&quot;</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Vote buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                        variant={currentResponse === 'yes' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            "h-8 px-3 rounded-lg text-xs gap-1.5",
                            currentResponse === 'yes' ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50"
                        )}
                        onClick={() => handleVote('yes')}
                        disabled={isSubmitting}
                    >
                        <Check className="w-3.5 h-3.5" />
                        Yes
                    </Button>
                    <Button
                        variant={currentResponse === 'maybe' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            "h-8 px-3 rounded-lg text-xs gap-1.5",
                            currentResponse === 'maybe' ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:text-amber-700 hover:border-amber-200 hover:bg-amber-50"
                        )}
                        onClick={() => handleVote('maybe')}
                        disabled={isSubmitting}
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        Maybe
                    </Button>
                    <Button
                        variant={currentResponse === 'no' ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                            "h-8 px-3 rounded-lg text-xs gap-1.5",
                            currentResponse === 'no' ? "bg-rose-600 hover:bg-rose-700 text-white" : "hover:text-rose-700 hover:border-rose-200 hover:bg-rose-50"
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
            {currentResponse && (
                <div className="px-4 pb-3">
                    {!noteOpen ? (
                        <button
                            onClick={() => setNoteOpen(true)}
                            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
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
                                className="text-sm h-8 bg-white border-slate-200 rounded-lg pr-8"
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
