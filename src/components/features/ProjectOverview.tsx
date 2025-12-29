'use client'

import React, { useState, useEffect, useRef } from 'react'
import { updateProjectMetadata } from '@/actions/overview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check, CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Project } from '@/payload-types'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface ProjectOverviewProps {
    project: Project
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
    const [title, setTitle] = useState(project.title)
    const [date, setDate] = useState<Date | undefined>(project.date ? new Date(project.date) : undefined)
    const [type, setType] = useState<string>(project.type)
    const [occasionType, setOccasionType] = useState<string>((project as any).occasionType || 'gift')
    const [speechDescription, setSpeechDescription] = useState<string>((project as any).speechDescription || '')
    const [speechReceiverName, setSpeechReceiverName] = useState<string>((project as any).speechReceiverName || '')

    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const isMounted = useRef(false)

    // Debounced Auto-Save
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsSaving(true)
            const formData = new FormData()
            formData.append('title', title)
            if (date) formData.append('date', date.toISOString())
            formData.append('type', type)
            formData.append('occasionType', occasionType)
            formData.append('speechDescription', speechDescription)
            formData.append('speechReceiverName', speechReceiverName)

            const result = await updateProjectMetadata(project.id, formData)

            setIsSaving(false)
            if (result?.error) {
                toast.error('Failed to save changes')
            } else {
                setLastSaved(new Date())
            }
        }, 1000) // 1s debounce

        return () => clearTimeout(timeoutId)
    }, [title, date, type, occasionType, speechDescription, speechReceiverName, project.id])

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Saving Indicator - Sticky or near top */}
            <div className="h-6 flex items-center justify-end text-sm text-muted-foreground">
                {isSaving ? (
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Saving...</span>
                    </div>
                ) : lastSaved ? (
                    <div className="flex items-center gap-2 text-emerald-600 animate-in fade-in slide-in-from-bottom-1">
                        <Check className="w-3 h-3" />
                        <span>Saved</span>
                    </div>
                ) : null}
            </div>

            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                    <CardTitle className="text-xl font-semibold text-slate-800">Project Details</CardTitle>
                    <CardDescription className="text-slate-500">Update the core information for your speech.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    {/* Main Info */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium text-slate-700">Speech Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="font-medium text-lg h-12 rounded-xl bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm transition-all placeholder:text-slate-300"
                                placeholder="e.g. Best Man Speech for John"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="speechDescription" className="text-sm font-medium text-slate-700">Speech Description</Label>
                            <p className="text-xs text-slate-500 pb-2">Provide a high-level summary of what this speech is about. Useful for collaborators.</p>
                            <textarea
                                id="speechDescription"
                                value={speechDescription}
                                onChange={(e) => setSpeechDescription(e.target.value)}
                                className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base ring-offset-background placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] shadow-sm transition-all resize-y"
                                placeholder="e.g. A funny and heartwarming speech about our childhood adventures..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="speechReceiverName" className="text-sm font-medium text-slate-700">Speech Receiver Name</Label>
                            <p className="text-xs text-slate-500 pb-2">Who is this speech for? This will personalize questions.</p>
                            <Input
                                id="speechReceiverName"
                                value={speechReceiverName}
                                onChange={(e) => setSpeechReceiverName(e.target.value)}
                                className="h-12 rounded-xl bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm transition-all placeholder:text-slate-300"
                                placeholder="e.g. John Smith"
                            />
                        </div>
                    </div>

                    {/* Context Divider */}
                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* Role / Context */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium text-slate-700">Your Role / Context</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                className={cn(
                                    "text-left relative rounded-2xl p-6 transition-all duration-200 border-2 select-none",
                                    occasionType === 'gift'
                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                                        : "border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200 text-slate-600"
                                )}
                                onClick={() => setOccasionType('gift')}
                            >
                                <div className="font-semibold text-lg mb-2 flex items-center gap-2 text-slate-900">
                                    <span className="text-2xl">🎁</span>
                                    <span>Event Host</span>
                                </div>
                                <div className="text-sm text-slate-500 leading-relaxed">I&apos;m giving this speech as a surprise/gift. I need to organize the moment and invites.</div>
                            </button>

                            <button
                                type="button"
                                className={cn(
                                    "text-left relative rounded-2xl p-6 transition-all duration-200 border-2 select-none",
                                    occasionType === 'standard'
                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                                        : "border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200 text-slate-600"
                                )}
                                onClick={() => setOccasionType('standard')}
                            >
                                <div className="font-semibold text-lg mb-2 flex items-center gap-2 text-slate-900">
                                    <span className="text-2xl">🎤</span>
                                    <span>Guest Speaker</span>
                                </div>
                                <div className="text-sm text-slate-500 leading-relaxed">I&apos;m hosting myself or speaking at someone else&apos;s event. Logistics/invites are handled separately.</div>
                            </button>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-sm font-medium text-slate-700">Occasion Type</Label>
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="wedding">Wedding</SelectItem>
                                    <SelectItem value="birthday">Birthday</SelectItem>
                                    <SelectItem value="funeral">Funeral</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label htmlFor="date" className="text-sm font-medium text-slate-700">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-12 justify-start text-left font-normal rounded-xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 focus:border-primary focus:ring-primary shadow-sm transition-all",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
