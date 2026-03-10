'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Clock, Plus, Trash2, Check, X, HelpCircle, MessageSquare, Link2, Mail, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { addDateOption, deleteDateOption, type DateOptionWithResponses } from '@/actions/scheduling'
import { sendSchedulingToCollaborators, sendSchedulingToEmails } from '@/actions/scheduling-email'
import { toast } from 'sonner'
import { useLocale } from 'next-intl'

interface DateSchedulerProps {
    projectId: number
    initialOptions: DateOptionWithResponses[]
    shareToken?: string | null
    guests?: Array<{ id: number; name: string | null; email: string }>
}

export function DateScheduler({ projectId, initialOptions, shareToken, guests = [] }: DateSchedulerProps) {
    const [options, setOptions] = useState<DateOptionWithResponses[]>(initialOptions)
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [time, setTime] = useState('')
    const [note, setNote] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)
    const [linkCopied, setLinkCopied] = useState(false)
    const [isSendingEmails, setIsSendingEmails] = useState(false)
    const [isSendingAdditional, setIsSendingAdditional] = useState(false)
    const [additionalEmails, setAdditionalEmails] = useState<{ email: string; name: string }[]>([])
    const [newEmail, setNewEmail] = useState('')
    const [newName, setNewName] = useState('')
    const locale = useLocale()

    const shareableLink = shareToken
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${locale}/scheduling/${shareToken}`
        : ''

    const copyLink = () => {
        if (!shareableLink) return
        navigator.clipboard.writeText(shareableLink)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
    }

    const addAdditionalEmail = () => {
        if (newEmail && newEmail.includes('@')) {
            setAdditionalEmails([...additionalEmails, { email: newEmail, name: newName }])
            setNewEmail('')
            setNewName('')
        }
    }

    const removeAdditionalEmail = (index: number) => {
        setAdditionalEmails(additionalEmails.filter((_, i) => i !== index))
    }

    React.useEffect(() => {
        setOptions(initialOptions)
    }, [initialOptions])

    const handleAddOption = async () => {
        if (!date) return

        setIsAdding(true)
        const result = await addDateOption(projectId, date, time, note)

        if (result.success) {
            toast.success('Date option added')

            if (result.option) {
                const newOpt: DateOptionWithResponses = {
                    ...result.option,
                    responses: []
                }
                setOptions(prev => [...prev, newOpt])
            }

            setDate(undefined)
            setTime('')
            setNote('')
        } else {
            toast.error(result.error || 'Failed to add date option')
        }
        setIsAdding(false)
    }

    const handleDelete = async (id: number) => {
        setIsDeleting(id)
        const previousOptions = options
        setOptions(prev => prev.filter(o => o.id !== id))

        const result = await deleteDateOption(id, projectId)
        if (result.success) {
            toast.success('Date option removed')
        } else {
            toast.error(result.error || 'Failed to remove option')
            setOptions(previousOptions)
        }
        setIsDeleting(null)
    }

    return (
        <div className="space-y-6">
            {/* Propose dates */}
            <div className="space-y-3">
                <h2 className="text-sm font-medium text-slate-500">Propose dates</h2>
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Calendar */}
                        <div>
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-lg border border-slate-100 mx-auto"
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-500">Time (optional)</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                                    <Input
                                        placeholder="e.g. 18:00"
                                        className="pl-9 h-9 text-sm bg-white border-slate-200 rounded-lg"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs text-slate-500">Note (optional)</label>
                                <Textarea
                                    placeholder="e.g. Bank holiday weekend..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="resize-none text-sm bg-white border-slate-200 rounded-lg min-h-[60px]"
                                    rows={2}
                                />
                            </div>

                            <Button
                                onClick={handleAddOption}
                                disabled={!date || isAdding}
                                size="sm"
                                className="w-full h-9 rounded-lg"
                            >
                                {isAdding ? 'Adding...' : (
                                    <><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Option</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Proposed options */}
            {options.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-medium text-slate-500">Proposed options ({options.length})</h2>
                    <div className="space-y-2">
                        {options.map((opt) => {
                            const yesCount = opt.responses.filter(r => r.response === 'yes').length
                            const noCount = opt.responses.filter(r => r.response === 'no').length
                            const maybeCount = opt.responses.filter(r => r.response === 'maybe').length
                            const isPopular = yesCount > 0 && yesCount >= Math.max(...options.map(o => o.responses.filter(r => r.response === 'yes').length))

                            return (
                                <div
                                    key={opt.id}
                                    className={cn(
                                        "bg-white rounded-xl border overflow-hidden",
                                        isPopular ? "border-primary/30" : "border-slate-100"
                                    )}
                                >
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        {/* Date badge */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-lg flex flex-col items-center justify-center border text-xs shrink-0",
                                            isPopular ? "border-primary/30 text-primary bg-primary/5" : "border-slate-200 text-slate-500"
                                        )}>
                                            <span className="text-[9px] uppercase font-bold leading-none">{format(new Date(opt.proposedDate), 'MMM')}</span>
                                            <span className="text-lg font-bold leading-none">{format(new Date(opt.proposedDate), 'd')}</span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900">{format(new Date(opt.proposedDate), 'EEEE, MMMM do')}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                {opt.proposedTime && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {opt.proposedTime}
                                                    </span>
                                                )}
                                                {opt.note && (
                                                    <span className="flex items-center gap-1" title={opt.note}>
                                                        <MessageSquare className="w-3 h-3" />
                                                        {opt.note}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Vote counts */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="flex items-center gap-1 text-xs text-emerald-600">
                                                <Check className="w-3 h-3" />{yesCount}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-amber-500">
                                                <HelpCircle className="w-3 h-3" />{maybeCount}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-rose-500">
                                                <X className="w-3 h-3" />{noCount}
                                            </span>
                                        </div>

                                        {/* Responder avatars */}
                                        {opt.responses.length > 0 && (
                                            <div className="flex -space-x-1.5 shrink-0">
                                                {opt.responses.slice(0, 5).map((resp) => (
                                                    <div
                                                        key={resp.id}
                                                        title={`${resp.guest.name || resp.guest.email} - ${resp.response}${resp.note ? `: "${resp.note}"` : ''}`}
                                                        className={cn(
                                                            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white",
                                                            resp.response === 'yes' ? "bg-emerald-100 text-emerald-700" :
                                                                resp.response === 'no' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                                        )}
                                                    >
                                                        {resp.guest.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Delete */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-slate-300 hover:text-red-500 shrink-0"
                                            onClick={() => handleDelete(opt.id)}
                                            disabled={isDeleting === opt.id}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Share section */}
            {shareToken && (
                <div className="space-y-3">
                    <h2 className="text-sm font-medium text-slate-500">Share</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Via link */}
                        <div className="bg-white rounded-xl border border-slate-100 p-4">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Via link</p>
                            <Button
                                onClick={copyLink}
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "h-9 rounded-lg w-full",
                                    linkCopied && "bg-emerald-50 text-emerald-600 border-emerald-200"
                                )}
                            >
                                {linkCopied ? (
                                    <><Check className="w-3.5 h-3.5 mr-1.5" /> Copied!</>
                                ) : (
                                    <><Link2 className="w-3.5 h-3.5 mr-1.5" /> Copy scheduling link</>
                                )}
                            </Button>
                        </div>

                        {/* Via email — collaborators */}
                        <div className="bg-white rounded-xl border border-slate-100 p-4">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Via email — collaborators</p>
                            {guests.length === 0 ? (
                                <p className="text-xs text-slate-400">No collaborators yet.</p>
                            ) : (
                                <div className="space-y-2">
                                    <div className="space-y-1">
                                        {guests.map((g) => (
                                            <div key={g.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                <span className="font-medium truncate">{g.name || g.email}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        onClick={async () => {
                                            setIsSendingEmails(true)
                                            const result = await sendSchedulingToCollaborators(projectId)
                                            setIsSendingEmails(false)
                                            if (result.error) {
                                                toast.error(result.error)
                                            } else {
                                                toast.success(`Sent to ${result.sent} collaborator${result.sent === 1 ? '' : 's'}`)
                                            }
                                        }}
                                        disabled={isSendingEmails}
                                        size="sm"
                                        className="h-9 rounded-lg w-full"
                                    >
                                        {isSendingEmails ? (
                                            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending...</>
                                        ) : (
                                            <><Mail className="w-3.5 h-3.5 mr-1.5" /> Send to All</>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Via email — additional */}
                    <div className="bg-white rounded-xl border border-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Via email — additional</p>
                        <div className="flex flex-col sm:flex-row gap-2 mb-2">
                            <Input
                                placeholder="Name (optional)"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="h-9 text-sm bg-white border-slate-200 rounded-lg sm:w-36"
                            />
                            <Input
                                type="email"
                                placeholder="Email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAdditionalEmail())}
                                className="h-9 text-sm bg-white border-slate-200 rounded-lg sm:flex-1"
                            />
                            <Button
                                onClick={addAdditionalEmail}
                                variant="outline"
                                size="sm"
                                disabled={!newEmail.includes('@')}
                                className="h-9 rounded-lg px-4 shrink-0"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add
                            </Button>
                        </div>
                        {additionalEmails.length > 0 && (
                            <>
                                <div className="space-y-1 mb-3">
                                    {additionalEmails.map((r, index) => (
                                        <div key={index} className="flex items-center gap-2 px-2 py-1 rounded-lg text-sm">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                            <span className="font-medium text-slate-900 truncate">{r.name || r.email}</span>
                                            {r.name && <span className="text-xs text-slate-400 truncate">{r.email}</span>}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeAdditionalEmail(index)}
                                                className="h-6 w-6 ml-auto text-slate-300 hover:text-red-500 hover:bg-red-50 shrink-0"
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    onClick={async () => {
                                        setIsSendingAdditional(true)
                                        const result = await sendSchedulingToEmails(
                                            projectId,
                                            additionalEmails.map(r => ({ email: r.email, name: r.name || undefined }))
                                        )
                                        setIsSendingAdditional(false)
                                        if (result.error) {
                                            toast.error(result.error)
                                        } else {
                                            toast.success(`Sent to ${result.sent} recipient${result.sent === 1 ? '' : 's'}`)
                                            setAdditionalEmails([])
                                        }
                                    }}
                                    disabled={isSendingAdditional}
                                    size="sm"
                                    className="h-9 rounded-lg px-4"
                                >
                                    {isSendingAdditional ? (
                                        <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending...</>
                                    ) : (
                                        <><Mail className="w-3.5 h-3.5 mr-1.5" /> Send to {additionalEmails.length}</>
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
