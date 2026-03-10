'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { updateProjectMetadata, deleteProject } from '@/actions/overview'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, Check, CalendarIcon, Trash2, MapPin } from 'lucide-react'
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
        }, 1000)

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
        <div className="space-y-6">

            {/* Speech Type */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-slate-500">Speech Type</h2>
                    <div className="h-5 flex items-center text-xs text-slate-400">
                        {isSaving ? (
                            <span className="flex items-center gap-1.5">
                                <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                            </span>
                        ) : lastSaved ? (
                            <span className="flex items-center gap-1.5 text-emerald-500">
                                <Check className="w-3 h-3" /> Saved
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        className={cn(
                            "relative rounded-xl p-4 transition-all border-2 flex flex-col items-center text-center",
                            speechType === 'gift'
                                ? "border-primary bg-primary/5"
                                : "border-transparent bg-white hover:border-slate-200"
                        )}
                        onClick={() => setSpeechType('gift')}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/branding/toast-as-present-logo.webp"
                            alt="Speech as a Gift"
                            className="h-14 w-auto object-contain mb-2"
                        />
                        <span className="font-medium text-sm text-slate-900">Speech as a Gift</span>
                        <span className="text-xs text-slate-400 mt-0.5">You are organizing the event</span>
                    </button>
                    <button
                        type="button"
                        className={cn(
                            "relative rounded-xl p-4 transition-all border-2 flex flex-col items-center text-center",
                            speechType === 'occasion'
                                ? "border-primary bg-primary/5"
                                : "border-transparent bg-white hover:border-slate-200"
                        )}
                        onClick={() => setSpeechType('occasion')}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/images/branding/toast-at-the-occasion-logo.webp"
                            alt="Speech for the Occasion"
                            className="h-14 w-auto object-contain mb-2"
                        />
                        <span className="font-medium text-sm text-slate-900">For the Occasion</span>
                        <span className="text-xs text-slate-400 mt-0.5">Location/time set by someone else</span>
                    </button>
                </div>
            </div>

            {/* Occasion & Date */}
            <div>
                <h2 className="text-sm font-medium text-slate-500 mb-3">Occasion & Date</h2>
                <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="occasionType" className="text-xs text-slate-500">Type</Label>
                            <Select value={occasionType} onValueChange={setOccasionType}>
                                <SelectTrigger className="h-9 text-sm rounded-lg border-slate-200">
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
                                    className="h-9 text-sm rounded-lg border-slate-200"
                                    placeholder="Describe your occasion..."
                                />
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="date" className="text-xs text-slate-500">Date</Label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={dateKnown}
                                        onChange={(e) => setDateKnown(e.target.checked)}
                                        className="rounded border-slate-300 w-3.5 h-3.5"
                                    />
                                    <span className="text-xs text-slate-400">Known</span>
                                </label>
                            </div>
                            {dateKnown ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full h-9 justify-start text-left text-sm font-normal rounded-lg border-slate-200",
                                                !date && "text-slate-400"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                                            {date ? format(date, "PPP") : "Pick a date"}
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
                                <div className="h-9 flex items-center px-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-400">
                                    To be determined
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Details */}
            <div>
                <h2 className="text-sm font-medium text-slate-500 mb-3">Details</h2>
                <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="title" className="text-xs text-slate-500">Speech Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="h-9 text-sm font-medium rounded-lg border-slate-200"
                            placeholder="e.g. Best Man Speech for John"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="honoree" className="text-xs text-slate-500">Who is the speech for?</Label>
                        <Input
                            id="honoree"
                            value={honoree}
                            onChange={(e) => setHonoree(e.target.value)}
                            className="h-9 text-sm rounded-lg border-slate-200"
                            placeholder="e.g. John, John and Mary"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="speechDescription" className="text-xs text-slate-500">Description</Label>
                        <textarea
                            id="speechDescription"
                            value={speechDescription}
                            onChange={(e) => setSpeechDescription(e.target.value)}
                            className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 min-h-[72px] resize-y"
                            placeholder="A high-level summary for collaborators..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="eventContext" className="text-xs text-slate-500">Additional Context <span className="text-slate-300">(optional)</span></Label>
                        <Input
                            id="eventContext"
                            value={eventContext}
                            onChange={(e) => setEventContext(e.target.value)}
                            className="h-9 text-sm rounded-lg border-slate-200"
                            placeholder="e.g. 25th wedding anniversary, 50th birthday..."
                        />
                    </div>
                </div>
            </div>

            {/* Logistics (Gift flow only) */}
            {speechType === 'gift' && (
                <div>
                    <h2 className="text-sm font-medium text-slate-500 mb-3">Logistics</h2>
                    <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="city" className="text-xs text-slate-500">City</Label>
                                <Input
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="h-9 text-sm rounded-lg border-slate-200"
                                    placeholder="e.g. Amsterdam"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="guestCount" className="text-xs text-slate-500">Guests</Label>
                                <Input
                                    id="guestCount"
                                    type="number"
                                    value={guestCount}
                                    onChange={(e) => setGuestCount(e.target.value)}
                                    className="h-9 text-sm rounded-lg border-slate-200"
                                    placeholder="e.g. 50"
                                />
                            </div>
                        </div>
                        {project.locationSettings?.address && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 pt-1">
                                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                {project.locationSettings.name ? (
                                    <span><strong>{project.locationSettings.name}</strong> · {project.locationSettings.address}</span>
                                ) : (
                                    <span>{project.locationSettings.address}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Danger Zone */}
            <div>
                <div className="bg-white rounded-xl border border-red-100 p-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-900">Delete this project</p>
                        <p className="text-xs text-slate-400">Permanently remove this project and all its data.</p>
                    </div>
                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="shrink-0 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                Delete
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="text-red-600">Delete Project</DialogTitle>
                                <DialogDescription>
                                    This will permanently delete <strong className="text-slate-900">&quot;{project.name}&quot;</strong> and all associated data.
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
                                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...</>
                                    ) : (
                                        'Delete permanently'
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    )
}
