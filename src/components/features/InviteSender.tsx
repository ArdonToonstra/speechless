'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Plus, X, Eye, Clock, Package, AlertCircle, Sparkles } from 'lucide-react'
import { prepareSpeechInvites, validatePostcardOption } from '@/actions/invites'
import { useRouter } from 'next/navigation'

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
import { cn } from '@/lib/utils'

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

    // State
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

    // Get default template for current message type
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

    // Initialize custom message with default template
    useEffect(() => {
        setCustomMessage(defaultTemplate)
    }, [defaultTemplate])

    // Check postcard eligibility
    useEffect(() => {
        const checkEligibility = async () => {
            const result = await validatePostcardOption(project.id)
            setPostcardEligibility(result)
        }
        checkEligibility()
    }, [project.id])

    // Handlers
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
            // Reset form
            setSelectedGuestIds([])
            setAdditionalRecipients([])
        } else {
            alert('Failed to prepare invites: ' + result.message)
        }
    }

    return (
        <div className="space-y-8">
            {/* Recipient Selection */}
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                    <CardTitle className="text-xl font-semibold text-slate-800">Select Recipients</CardTitle>
                    <CardDescription className="text-slate-500">Choose collaborators or add additional email addresses</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    {/* Existing Guests */}
                    {guests.length > 0 && (
                        <div>
                            <Label className="text-sm font-medium text-slate-700 mb-3 block">Collaborators ({guests.length})</Label>
                            <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                                {guests.map((guest) => (
                                    <div key={guest.id} className="flex items-center gap-3 p-3 hover:bg-white hover:shadow-sm rounded-lg transition-all cursor-pointer" onClick={() => toggleGuest(guest.id)}>
                                        <Checkbox
                                            checked={selectedGuestIds.includes(guest.id)}
                                            onCheckedChange={() => toggleGuest(guest.id)}
                                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-slate-300"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-slate-900">{guest.name || 'Unnamed'}</p>
                                            <p className="text-xs text-slate-500">{guest.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Recipients */}
                    <div>
                        <Label className="text-sm font-medium text-slate-700 mb-3 block">Additional Recipients</Label>
                        <div className="flex gap-3 mb-3">
                            <Input
                                placeholder="Name (optional)"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1 bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm h-11 rounded-xl"
                            />
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="flex-1 bg-white border-slate-200 focus:border-primary focus:ring-primary shadow-sm h-11 rounded-xl"
                            />
                            <Button onClick={addRecipient} variant="outline" size="icon" className="h-11 w-11 rounded-xl border-slate-200 hover:bg-slate-50">
                                <Plus className="w-5 h-5 text-slate-600" />
                            </Button>
                        </div>
                        {additionalRecipients.length > 0 && (
                            <div className="space-y-2">
                                {additionalRecipients.map((recipient, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-slate-100 shadow-sm rounded-xl">
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{recipient.name || 'Unnamed'}</p>
                                            <p className="text-xs text-slate-500">{recipient.email}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeRecipient(index)}
                                            className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-sm text-slate-500">
                            Total recipients: <strong className="text-slate-900">{totalRecipients}</strong>
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Message Type & Template */}
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                    <CardTitle className="text-xl font-semibold text-slate-800">Message & Template</CardTitle>
                    <CardDescription className="text-slate-500">Customize your invitation message</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    {/* Message Type */}
                    <div>
                        <Label className="text-sm font-medium text-slate-700 mb-4 block">Message Type</Label>
                        <RadioGroup value={messageType} onValueChange={(v: any) => setMessageType(v)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={cn(
                                "flex items-start space-x-3 p-4 border rounded-xl cursor-pointer transition-all",
                                messageType === 'attendee' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            )}>
                                <RadioGroupItem value="attendee" id="attendee" className="mt-1" />
                                <Label htmlFor="attendee" className="flex-1 cursor-pointer">
                                    <span className="font-semibold text-slate-900">Attendee Message</span>
                                    <span className="block text-xs text-slate-500 mt-1 leading-relaxed">
                                        For guests attending the event. Includes venue details.
                                    </span>
                                </Label>
                            </div>
                            <div className={cn(
                                "flex items-start space-x-3 p-4 border rounded-xl cursor-pointer transition-all",
                                messageType === 'receiver' ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            )}>
                                <RadioGroupItem value="receiver" id="receiver" className="mt-1" />
                                <Label htmlFor="receiver" className="flex-1 cursor-pointer">
                                    <span className="font-semibold text-slate-900">Receiver Message</span>
                                    <span className="block text-xs text-slate-500 mt-1 leading-relaxed">
                                        For the person receiving the speech. Focuses on the surprise.
                                    </span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Message Editor */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-slate-700">Message Template</Label>
                            <Button variant="ghost" size="sm" onClick={resetTemplate} className="text-xs h-8 text-primary hover:text-primary/80 hover:bg-primary/5">
                                Reset to Default
                            </Button>
                        </div>
                        <Textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            rows={10}
                            className="font-mono text-sm bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary shadow-inner rounded-xl leading-relaxed p-4"
                        />
                        <p className="text-xs text-slate-500">
                            Available placeholders: <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{'{name}'}</code>,{' '}
                            <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{'{date}'}</code>,{' '}
                            <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{'{venue}'}</code>,{' '}
                            <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{'{time}'}</code>,{' '}
                            <code className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{'{address}'}</code>
                        </p>
                    </div>

                    {/* Preview Button */}
                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full h-11 rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview Message
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle>Message Preview</DialogTitle>
                                <DialogDescription>
                                    This is how your message will appear to recipients
                                </DialogDescription>
                            </DialogHeader>
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 whitespace-pre-wrap font-serif text-slate-800 leading-relaxed shadow-inner">
                                {renderPreview()}
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Postcard Option */}
            <Card className="relative overflow-hidden border-none shadow-sm rounded-2xl bg-white">
                <div className="absolute top-4 right-4 z-10">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Coming Soon
                    </Badge>
                </div>
                <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                    <CardTitle className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                        <Package className="w-5 h-5 text-slate-400" />
                        Postcard Delivery
                    </CardTitle>
                    <CardDescription className="text-slate-500">Send a physical postcard in addition to email</CardDescription>
                </CardHeader>
                <CardContent className="p-8 opacity-60 pointer-events-none select-none grayscale-[0.5]">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="flex items-center gap-4">
                            <Checkbox
                                disabled
                                checked={sendViaPostcard}
                                onCheckedChange={(checked) => setSendViaPostcard(checked as boolean)}
                            />
                            <div>
                                <Label className="font-semibold text-slate-900">Send via Physical Postcard</Label>
                                <p className="text-xs text-slate-500 mt-1">$2.99 per postcard • Worldwide shipping</p>
                            </div>
                        </div>
                    </div>

                    {postcardEligibility && !postcardEligibility.eligible && (
                        <Alert variant="destructive" className="mt-4 rounded-xl">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <Clock className="w-3 h-3 inline mr-1" />
                                Postcards require at least 5 days before the event. You have {postcardEligibility.daysUntilEvent} days remaining.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Send Button */}
            <Button
                onClick={handleSend}
                disabled={isSending || totalRecipients === 0}
                className="w-full rounded-xl shadow-lg shadow-primary/20 h-12 text-lg font-medium"
                size="lg"
            >
                <Mail className="w-5 h-5 mr-2" />
                {isSending ? 'Preparing...' : `Prepare ${totalRecipients} Invite${totalRecipients !== 1 ? 's' : ''}`}
            </Button>

            {totalRecipients === 0 && (
                <p className="text-sm text-center text-slate-400 animate-pulse">
                    Select at least one recipient to prepare invites
                </p>
            )}
        </div>
    )
}
