'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Check, X, HelpCircle, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { addDateOption, deleteDateOption, type DateOptionWithResponses } from '@/actions/scheduling'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DateSchedulerProps {
    projectId: number
    initialOptions: DateOptionWithResponses[]
}

export function DateScheduler({ projectId, initialOptions }: DateSchedulerProps) {
    const [options, setOptions] = useState<DateOptionWithResponses[]>(initialOptions)
    const [date, setDate] = useState<Date | undefined>(undefined)
    const [time, setTime] = useState('')
    const [note, setNote] = useState('')
    const [isAdding, setIsAdding] = useState(false)
    const [isDeleting, setIsDeleting] = useState<number | null>(null)

    // Sync options when prop updates (e.g. after server revalidation)
    React.useEffect(() => {
        setOptions(initialOptions)
    }, [initialOptions])

    const handleAddOption = async () => {
        if (!date) return

        setIsAdding(true)
        const result = await addDateOption(projectId, date, time, note)

        if (result.success) {
            toast.success('Date option added')

            // Optimistically update local state if we got the new option back
            if (result.option) {
                const newOpt: DateOptionWithResponses = {
                    ...result.option,
                    responses: [] // New option has no responses yet
                }
                setOptions(prev => [...prev, newOpt])
            }

            // Reset form
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
        // Optimistic remove
        const previousOptions = options
        setOptions(prev => prev.filter(o => o.id !== id))

        const result = await deleteDateOption(id, projectId)
        if (result.success) {
            toast.success('Date option removed')
        } else {
            toast.error(result.error || 'Failed to remove option')
            // Revert on failure
            setOptions(previousOptions)
        }
        setIsDeleting(null)
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Propose Dates</CardTitle>
                    <CardDescription>
                        Suggest multiple dates and times for the event. Collaborators can vote on their availability.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Date Picker */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Select Date</label>
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    className="rounded-md border shadow-sm mx-auto"
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </div>
                        </div>

                        {/* Details Form */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Time (optional)</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="e.g. 18:00 or 6:00 PM"
                                        className="pl-9"
                                        value={time}
                                        onChange={(e) => setTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Note (optional)</label>
                                <Textarea
                                    placeholder="e.g. This is a bank holiday weekend..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="pt-2">
                                <Button
                                    onClick={handleAddOption}
                                    disabled={!date || isAdding}
                                    className="w-full"
                                >
                                    {isAdding ? 'Adding...' : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Add Option
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {options.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Proposed Options</h3>
                    <div className="grid gap-4">
                        {options.map((opt) => {
                            const yesCount = opt.responses.filter(r => r.response === 'yes').length
                            const noCount = opt.responses.filter(r => r.response === 'no').length
                            const maybeCount = opt.responses.filter(r => r.response === 'maybe').length

                            // Check max votes to highlight best option
                            // Simple logic: max yes votes
                            const isPopular = yesCount > 0 && yesCount >= Math.max(...options.map(o => o.responses.filter(r => r.response === 'yes').length))

                            return (
                                <Card key={opt.id} className={cn("overflow-hidden transition-all", isPopular && "border-primary/50 bg-primary/5")}>
                                    <CardContent className="p-0">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Date Info */}
                                            <div className="p-6 flex-1 min-w-0">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "w-12 h-12 rounded-lg flex flex-col items-center justify-center border font-semibold",
                                                            isPopular ? "bg-white border-primary/30 text-primary" : "bg-white border-border/60 text-muted-foreground"
                                                        )}>
                                                            <span className="text-[10px] uppercase leading-none">{format(new Date(opt.proposedDate), 'MMM')}</span>
                                                            <span className="text-xl leading-none">{format(new Date(opt.proposedDate), 'd')}</span>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-lg">{format(new Date(opt.proposedDate), 'EEEE, MMMM do')}</h4>
                                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                                {opt.proposedTime && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="w-3 h-3" />
                                                                        {opt.proposedTime}
                                                                    </span>
                                                                )}
                                                                {opt.note && (
                                                                    <span className="flex items-center gap-1" title={opt.note}>
                                                                        <MessageSquare className="w-3 h-3" />
                                                                        Note
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-muted-foreground hover:text-destructive"
                                                        onClick={() => handleDelete(opt.id)}
                                                        disabled={isDeleting === opt.id}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                {opt.note && (
                                                    <div className="mt-2 text-sm bg-muted/50 p-2 rounded-md border text-muted-foreground inline-block">
                                                        {opt.note}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Responses Summary */}
                                            <div className="bg-slate-50/50 border-t md:border-t-0 md:border-l p-4 w-full md:w-64 shrink-0 flex flex-col justify-center gap-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                                                        <Check className="w-4 h-4" />
                                                        Yes
                                                    </div>
                                                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">{yesCount}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-1.5 text-amber-600 font-medium">
                                                        <HelpCircle className="w-4 h-4" />
                                                        Maybe
                                                    </div>
                                                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">{maybeCount}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-1.5 text-rose-600 font-medium">
                                                        <X className="w-4 h-4" />
                                                        No
                                                    </div>
                                                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-xs font-bold">{noCount}</span>
                                                </div>

                                                {/* Avatars of responders */}
                                                {(opt.responses.length > 0) && (
                                                    <div className="mt-2 flex -space-x-2 overflow-hidden py-1 pl-1">
                                                        {opt.responses.map((resp) => (
                                                            <div
                                                                key={resp.id}
                                                                className="relative group cursor-help"
                                                                title={`${resp.guest.name || resp.guest.email} - ${resp.response}${resp.note ? `: "${resp.note}"` : ''}`}
                                                            >
                                                                <Avatar className={cn(
                                                                    "inline-block h-6 w-6 ring-2 ring-white",
                                                                    resp.response === 'yes' ? "ring-emerald-100" :
                                                                        resp.response === 'no' ? "ring-rose-100" : "ring-amber-100"
                                                                )}>
                                                                    <AvatarFallback className={cn(
                                                                        "text-[10px]",
                                                                        resp.response === 'yes' ? "bg-emerald-100 text-emerald-700" :
                                                                            resp.response === 'no' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                                                    )}>
                                                                        {resp.guest.name?.charAt(0).toUpperCase() || '?'}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
