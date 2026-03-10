'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Mail, Plus, X, Eye, Package, Sparkles } from 'lucide-react'
import { prepareSpeechInvites, validatePostcardOption } from '@/actions/invites'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface Project {
    id: number
    name: string
    occasionDate: Date | null
    emailTemplates: {
        attendeeMessage?: string
        receiverMessage?: string
    } | null
    locationSettings?: {
        venue?: string
        time?: string
        address?: string
    } | null
}

interface Guest {
    id: number
    email: string
    name: string | null
}

interface InviteSenderProps {
    project: Project
    guests: Guest[]
}

interface AdditionalRecipient {
    email: string
    name: string
}

export function InviteSender({ project, guests }: InviteSenderProps) {
    const router = useRouter()

    const [selectedGuestIds, setSelectedGuestIds] = useState<number[]>([])
    const [additionalRecipients, setAdditionalRecipients] = useState<AdditionalRecipient[]>([])
    const [newEmail, setNewEmail] = useState('')
    const [newName, setNewName] = useState('')
    const [messageType, setMessageType] = useState<'attendee' | 'receiver'>('attendee')
    const [customMessage, setCustomMessage] = useState('')
    const [sendViaPostcard, setSendViaPostcard] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [postcardEligibility, setPostcardEligibility] = useState<{ eligible: boolean; daysUntilEvent: number } | null>(null)

    const defaultTemplate = useMemo(() => {
        const templates = project.emailTemplates || {}
        if (messageType === 'attendee') {
            return templates.attendeeMessage || `Hi {name},

You're invited to ${project.name} on {date}!

Location: {venue}
Time: {time}
Address: {address}

We're looking forward to celebrating with  you!`
        } else {
            return templates.receiverMessage || `Dear {name},

We're planning a special speech for you on {date}!

This is going to be a wonderful surprise, and we can't wait to share it with you.

See you there!`
        }
    }, [messageType, project])

    useEffect(() => {
        setCustomMessage(defaultTemplate)
    }, [defaultTemplate])

    useEffect(() => {
        const checkEligibility = async () => {
            const result = await validatePostcardOption(project.id)
            setPostcardEligibility(result)
        }
        checkEligibility()
    }, [project.id])

    const toggleGuest = (guestId: number) => {
        setSelectedGuestIds(prev =>
            prev.includes(guestId)
                ? prev.filter(id => id !== guestId)
                : [...prev, guestId]
        )
    }

    const addRecipient = () => {
        if (newEmail && newEmail.includes('@')) {
            setAdditionalRecipients([...additionalRecipients, { email: newEmail, name: newName }])
            setNewEmail('')
            setNewName('')
        }
    }

    const removeRecipient = (index: number) => {
        setAdditionalRecipients(additionalRecipients.filter((_, i) => i !== index))
    }

    const resetTemplate = () => {
        setCustomMessage(defaultTemplate)
    }

    const totalRecipients = useMemo(() => {
        return selectedGuestIds.length + additionalRecipients.length
    }, [selectedGuestIds, additionalRecipients])

    const renderPreview = () => {
        const sampleRecipient = selectedGuestIds.length > 0
            ? guests.find(g => g.id === selectedGuestIds[0])
            : additionalRecipients[0]

        let preview = customMessage
        preview = preview.replace(/{name}/g, sampleRecipient?.name || 'Guest')
        preview = preview.replace(/{projectTitle}/g, project.name)
        preview = preview.replace(/{date}/g, project.occasionDate ? new Date(project.occasionDate).toLocaleDateString() : 'TBD')
        const loc = project.locationSettings
        preview = preview.replace(/{venue}/g, loc?.venue || 'TBD')
        preview = preview.replace(/{time}/g, loc?.time || 'TBD')
        preview = preview.replace(/{address}/g, loc?.address || 'TBD')

        return preview
    }

    const handleSend = async () => {
        if (totalRecipients === 0) {
            alert('Please select at least one recipient')
            return
        }

        setIsSending(true)

        const allRecipients = [
            ...selectedGuestIds.map(id => {
                const guest = guests.find(g => g.id === id)
                return { email: guest!.email, name: guest!.name || undefined }
            }),
            ...additionalRecipients,
        ]

        const result = await prepareSpeechInvites(
            project.id,
            allRecipients,
            messageType,
            customMessage,
            sendViaPostcard
        )

        setIsSending(false)

        if (result.success) {
            alert(result.message)
            router.refresh()
            setSelectedGuestIds([])
            setAdditionalRecipients([])
        } else {
            alert('Failed to prepare invites: ' + result.message)
        }
    }

    return (
        <div className="space-y-6">
            {/* Recipients */}
            <div className="space-y-3">
                <h2 className="text-sm font-medium text-slate-500">Recipients</h2>

                {/* Collaborators */}
                {guests.length > 0 && (
                    <div className="bg-white rounded-xl border border-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Collaborators ({guests.length})</p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {guests.map((guest) => (
                                <div key={guest.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg cursor-pointer" onClick={() => toggleGuest(guest.id)}>
                                    <Checkbox
                                        checked={selectedGuestIds.includes(guest.id)}
                                        onCheckedChange={() => toggleGuest(guest.id)}
                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-slate-300"
                                    />
                                    <span className="text-sm font-medium text-slate-900 flex-1">{guest.name || 'Unnamed'}</span>
                                    <span className="text-xs text-slate-400">{guest.email}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional recipients */}
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Additional recipients</p>
                    <div className="flex gap-2 mb-2">
                        <Input
                            placeholder="Name (optional)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="h-9 text-sm bg-white border-slate-200 rounded-lg sm:w-36"
                        />
                        <Input
                            type="email"
                            placeholder="email@example.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="h-9 text-sm bg-white border-slate-200 rounded-lg flex-1"
                        />
                        <Button onClick={addRecipient} variant="outline" size="icon" className="h-9 w-9 rounded-lg border-slate-200 shrink-0">
                            <Plus className="w-4 h-4 text-slate-600" />
                        </Button>
                    </div>
                    {additionalRecipients.length > 0 && (
                        <div className="space-y-1">
                            {additionalRecipients.map((recipient, index) => (
                                <div key={index} className="flex items-center gap-2 px-2 py-1.5 rounded-lg">
                                    <span className="text-sm font-medium text-slate-900 flex-1">{recipient.name || 'Unnamed'}</span>
                                    <span className="text-xs text-slate-400">{recipient.email}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRecipient(index)}
                                        className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-slate-400 mt-2">Total: <strong className="text-slate-600">{totalRecipients}</strong> recipient{totalRecipients !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Message */}
            <div className="space-y-3">
                <h2 className="text-sm font-medium text-slate-500">Message</h2>

                {/* Message type */}
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Type</p>
                    <RadioGroup value={messageType} onValueChange={(v: any) => setMessageType(v)} className="grid grid-cols-2 gap-2">
                        <div className={cn(
                            "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all",
                            messageType === 'attendee' ? "border-primary bg-primary/5" : "border-slate-200 hover:bg-slate-50"
                        )}>
                            <RadioGroupItem value="attendee" id="attendee" />
                            <Label htmlFor="attendee" className="cursor-pointer text-sm">
                                <span className="font-medium text-slate-900">Attendee</span>
                                <span className="block text-[11px] text-slate-400">Includes venue details</span>
                            </Label>
                        </div>
                        <div className={cn(
                            "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all",
                            messageType === 'receiver' ? "border-primary bg-primary/5" : "border-slate-200 hover:bg-slate-50"
                        )}>
                            <RadioGroupItem value="receiver" id="receiver" />
                            <Label htmlFor="receiver" className="cursor-pointer text-sm">
                                <span className="font-medium text-slate-900">Receiver</span>
                                <span className="block text-[11px] text-slate-400">Surprise-focused</span>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* Template editor */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Template</p>
                        <button onClick={resetTemplate} className="text-xs text-primary hover:underline">
                            Reset
                        </button>
                    </div>
                    <Textarea
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                        rows={8}
                        className="font-mono text-sm bg-slate-50 border-slate-200 rounded-lg leading-relaxed p-3"
                    />
                    <p className="text-[11px] text-slate-400">
                        Placeholders: <code className="bg-slate-100 px-1 rounded">{'{name}'}</code>{' '}
                        <code className="bg-slate-100 px-1 rounded">{'{date}'}</code>{' '}
                        <code className="bg-slate-100 px-1 rounded">{'{venue}'}</code>{' '}
                        <code className="bg-slate-100 px-1 rounded">{'{time}'}</code>{' '}
                        <code className="bg-slate-100 px-1 rounded">{'{address}'}</code>
                    </p>
                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 rounded-lg w-full text-slate-600">
                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                Preview
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Message Preview</DialogTitle>
                                <DialogDescription>
                                    This is how your message will appear to recipients
                                </DialogDescription>
                            </DialogHeader>
                            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap font-serif text-sm text-slate-800 leading-relaxed">
                                {renderPreview()}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Postcard (Coming Soon) */}
            <div className="space-y-3">
                <h2 className="text-sm font-medium text-slate-500">
                    Extras
                    <span className="ml-2 text-[11px] font-normal text-amber-600 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Coming Soon</span>
                </h2>
                <div className="bg-white rounded-xl border border-slate-100 p-4 opacity-50 pointer-events-none">
                    <div className="flex items-center gap-3">
                        <Checkbox disabled checked={sendViaPostcard} onCheckedChange={(checked) => setSendViaPostcard(checked as boolean)} />
                        <div>
                            <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5 text-slate-400" />
                                Physical Postcard
                            </p>
                            <p className="text-xs text-slate-400">$2.99 per postcard · Worldwide shipping</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Send */}
            <Button
                onClick={handleSend}
                disabled={isSending || totalRecipients === 0}
                className="w-full rounded-lg h-10"
            >
                <Mail className="w-4 h-4 mr-2" />
                {isSending ? 'Preparing...' : `Prepare ${totalRecipients} Invite${totalRecipients !== 1 ? 's' : ''}`}
            </Button>

            {totalRecipients === 0 && (
                <p className="text-xs text-center text-slate-400">
                    Select at least one recipient to prepare invites
                </p>
            )}
        </div>
    )
}
