'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateProjectMetadata, deleteProject } from '@/actions/overview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Check, CalendarIcon, Trash2, AlertTriangle, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Project {
    id: number
    name: string
    speechType: string
    occasionType: string
    customOccasion: string | null
    occasionDate: Date | null
    dateKnown: boolean
    description: string | null
    honoree: string | null
    eventContext: string | null
    city: string | null
    guestCount: number | null
    locationSettings: {
        address?: string
        lat?: number
        lng?: number
        name?: string
    } | null
}

interface ProjectOverviewProps {
    project: Project
}

const OCCASION_TYPES = [
    { id: 'wedding', label: 'Wedding' },
    { id: 'birthday', label: 'Birthday' },
    { id: 'funeral', label: 'Funeral' },
    { id: 'retirement', label: 'Retirement' },
    { id: 'roast', label: 'Roast' },
    { id: 'surprise', label: 'Surprise' },
    { id: 'other', label: 'Other' },
]

export function ProjectOverview({ project }: ProjectOverviewProps) {
    const router = useRouter()

    // Form state
    const [title, setTitle] = useState(project.name)
    const [speechType, setSpeechType] = useState<string>(project.speechType || 'gift')
    const [occasionType, setOccasionType] = useState<string>(project.occasionType || 'other')
    const [customOccasion, setCustomOccasion] = useState<string>(project.customOccasion || '')
    const [dateKnown, setDateKnown] = useState<boolean>(project.dateKnown)
    const [date, setDate] = useState<Date | undefined>(project.occasionDate ? new Date(project.occasionDate) : undefined)
    const [speechDescription, setSpeechDescription] = useState<string>(project.description || '')
    const [honoree, setHonoree] = useState<string>(project.honoree || '')
    const [eventContext, setEventContext] = useState<string>(project.eventContext || '')
    const [city, setCity] = useState<string>(project.city || '')
    const [guestCount, setGuestCount] = useState<string>(project.guestCount?.toString() || '')

    // UI state
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
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
            formData.append('speechType', speechType)
            formData.append('occasionType', occasionType)
            formData.append('customOccasion', customOccasion)
            formData.append('dateKnown', dateKnown.toString())
            if (date) formData.append('date', date.toISOString())
            formData.append('speechDescription', speechDescription)
            formData.append('honoree', honoree)
            formData.append('eventContext', eventContext)
            formData.append('city', city)
            formData.append('guestCount', guestCount)

            const result = await updateProjectMetadata(project.id, formData)

            setIsSaving(false)
            if (result?.error) {
                toast.error('Failed to save changes')
            } else {
                setLastSaved(new Date())
            }
        }, 1000) // 1s debounce

        return () => clearTimeout(timeoutId)
    }, [title, speechType, occasionType, customOccasion, dateKnown, date, speechDescription, honoree, eventContext, city, guestCount, project.id])

    const handleDelete = async () => {
        if (deleteConfirmation !== project.name) return

        setIsDeleting(true)
        const result = await deleteProject(project.id)

        if (result.error) {
            toast.error(result.error)
            setIsDeleting(false)
        } else {
            toast.success('Project deleted successfully')
            router.push('/dashboard')
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Project Details Card */}
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl font-semibold text-slate-800">Project Details</CardTitle>
                            <CardDescription className="text-slate-500">Update the core information for your speech.</CardDescription>
                        </div>
                        {/* Saving Indicator */}
                        <div className="h-6 flex items-center text-sm text-muted-foreground">
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
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">

                    {/* Speech Type Selection */}
                    <div className="space-y-4">
                        <Label className="text-sm font-medium text-slate-700">Speech Type</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                className={cn(
                                    "text-center relative rounded-2xl p-6 transition-all duration-200 border-2 select-none flex flex-col items-center",
                                    speechType === 'gift'
                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                                        : "border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200 text-slate-600"
                                )}
                                onClick={() => setSpeechType('gift')}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/branding/toast-as-present-logo.webp"
                                    alt="Speech as a Gift"
                                    className="h-20 w-auto object-contain mb-3"
                                />
                                <div className="font-semibold text-lg mb-2 text-slate-900">
                                    Speech as a Gift
                                </div>
                                <div className="text-sm text-slate-500 leading-relaxed">You are organizing the event or surprise for someone.</div>
                            </button>

                            <button
                                type="button"
                                className={cn(
                                    "text-center relative rounded-2xl p-6 transition-all duration-200 border-2 select-none flex flex-col items-center",
                                    speechType === 'occasion'
                                        ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                                        : "border-transparent bg-slate-50 hover:bg-slate-100 hover:border-slate-200 text-slate-600"
                                )}
                                onClick={() => setSpeechType('occasion')}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/images/branding/toast-at-the-occasion-logo.webp"
                                    alt="Speech for the Occasion"
                                    className="h-20 w-auto object-contain mb-3"
                                />
                                <div className="font-semibold text-lg mb-2 text-slate-900">
                                    Speech for the Occasion
                                </div>
                                <div className="text-sm text-slate-500 leading-relaxed">The location/time is set by someone else.</div>
                            </button>
                        </div>
                    </div>

                    {/* Occasion Type & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="occasionType" className="text-sm font-medium text-slate-700">Occasion Type</Label>
                            <Select value={occasionType} onValueChange={setOccasionType}>
                                <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm transition-all">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {OCCASION_TYPES.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {occasionType === 'other' && (
                                <Input
                                    value={customOccasion}
                                    onChange={(e) => setCustomOccasion(e.target.value)}
                                    className="mt-2 h-12 rounded-xl bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm transition-all placeholder:text-slate-300"
                                    placeholder="Describe your occasion..."
                                />
                            )}
                        </div>
                        <div className="space-y-2 flex flex-col">
                            <Label htmlFor="date" className="text-sm font-medium text-slate-700">Event Date</Label>
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="checkbox"
                                    id="dateKnown"
                                    checked={dateKnown}
                                    onChange={(e) => setDateKnown(e.target.checked)}
                                    className="rounded border-slate-300"
                                />
                                <label htmlFor="dateKnown" className="text-sm text-slate-600">Date is known</label>
                            </div>
                            {dateKnown ? (
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
                            ) : (
                                <div className="h-12 flex items-center px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500">
                                    Date to be determined
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-slate-100 w-full"></div>

                    {/* Title & Description */}
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
                            <Label htmlFor="honoree" className="text-sm font-medium text-slate-700">Who is the speech for?</Label>
                            <p className="text-xs text-slate-500 pb-2">This will be used in questions like &quot;Share your best anecdote about them&quot;</p>
                            <Input
                                id="honoree"
                                value={honoree}
                                onChange={(e) => setHonoree(e.target.value)}
                                className="h-12 rounded-xl bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm transition-all placeholder:text-slate-300"
                                placeholder="e.g. John, John and Mary"
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
                            <Label htmlFor="eventContext" className="text-sm font-medium text-slate-700">Additional Context (optional)</Label>
                            <p className="text-xs text-slate-500 pb-2">Helps personalize invitations, e.g. &quot;25th wedding anniversary&quot;</p>
                            <Input
                                id="eventContext"
                                value={eventContext}
                                onChange={(e) => setEventContext(e.target.value)}
                                className="h-12 rounded-xl bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm transition-all placeholder:text-slate-300"
                                placeholder="e.g. 25th wedding anniversary, 50th birthday..."
                            />
                        </div>
                    </div>

                    {/* Logistics (Gift flow only) */}
                    {speechType === 'gift' && (
                        <>
                            <div className="h-px bg-slate-100 w-full"></div>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-slate-700">Logistics</Label>
                                    <p className="text-xs text-slate-500 mt-1">Optional: helps filter location suggestions</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="city" className="text-sm font-medium text-slate-700">City or Location</Label>
                                        <Input
                                            id="city"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            className="h-12 rounded-xl bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm transition-all placeholder:text-slate-300"
                                            placeholder="e.g. Amsterdam, New York..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guestCount" className="text-sm font-medium text-slate-700">Number of Guests</Label>
                                        <Input
                                            id="guestCount"
                                            type="number"
                                            value={guestCount}
                                            onChange={(e) => setGuestCount(e.target.value)}
                                            className="h-12 rounded-xl bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm transition-all placeholder:text-slate-300"
                                            placeholder="e.g. 50"
                                        />
                                    </div>
                                </div>
                                {project.locationSettings?.address && (
                                    <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="text-sm font-medium text-slate-700 mb-1">Selected Location (Map)</div>
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <span className="text-primary"><MapPin className="w-4 h-4" /></span>
                                            {project.locationSettings.name ? (
                                                <span>
                                                    <strong>{project.locationSettings.name}</strong> • {project.locationSettings.address}
                                                </span>
                                            ) : (
                                                <span>{project.locationSettings.address}</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b border-red-100 bg-red-50/50 px-8 py-6">
                    <CardTitle className="text-xl font-semibold text-red-800 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription className="text-red-600/80">Irreversible actions. Please proceed with caution.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-slate-900">Delete this project</h4>
                            <p className="text-sm text-slate-500">Once deleted, this project and all its data cannot be recovered.</p>
                        </div>
                        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="destructive" className="gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    Delete Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle className="w-5 h-5" />
                                        Delete Project
                                    </DialogTitle>
                                    <DialogDescription>
                                        This action cannot be undone. This will permanently delete the project
                                        <strong className="text-slate-900"> &quot;{project.name}&quot;</strong> and all associated data including questionnaire responses.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                    <Label htmlFor="deleteConfirmation" className="text-sm font-medium">
                                        Type <strong>{project.name}</strong> to confirm:
                                    </Label>
                                    <Input
                                        id="deleteConfirmation"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        placeholder="Enter project name"
                                        className="border-red-200 focus:border-red-400 focus:ring-red-400"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={deleteConfirmation !== project.name || isDeleting}
                                    >
                                        {isDeleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete permanently'
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
