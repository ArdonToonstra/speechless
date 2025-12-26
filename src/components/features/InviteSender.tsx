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
import { Guest, Project } from '@/payload-types'
import { prepareSpeechInvites, validatePostcardOption } from '@/actions/invites'
import { useRouter } from 'next/navigation'
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

You're invited to ${project.title} on {date}!

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
        preview = preview.replace(/{projectTitle}/g, project.title)
        preview = preview.replace(/{date}/g, project.date ? new Date(project.date).toLocaleDateString() : 'TBD')
        preview = preview.replace(/{venue}/g, project.location?.venue || 'TBD')
        preview = preview.replace(/{time}/g, project.location?.time || 'TBD')
        preview = preview.replace(/{address}/g, project.location?.address || 'TBD')

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
        <div className="space-y-6">
            {/* Recipient Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Recipients</CardTitle>
                    <CardDescription>Choose collaborators or add additional email addresses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Existing Guests */}
                    {guests.length > 0 && (
                        <div>
                            <Label className="text-sm font-medium mb-2 block">Collaborators ({guests.length})</Label>
                            <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                                {guests.map((guest) => (
                                    <div key={guest.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded">
                                        <Checkbox
                                            checked={selectedGuestIds.includes(guest.id)}
                                            onCheckedChange={() => toggleGuest(guest.id)}
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{guest.name || 'Unnamed'}</p>
                                            <p className="text-xs text-muted-foreground">{guest.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Recipients */}
                    <div>
                        <Label className="text-sm font-medium mb-2 block">Additional Recipients</Label>
                        <div className="flex gap-2 mb-2">
                            <Input
                                placeholder="Name (optional)"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                type="email"
                                placeholder="email@example.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="flex-1"
                            />
                            <Button onClick={addRecipient} variant="outline" size="icon">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {additionalRecipients.length > 0 && (
                            <div className="space-y-1">
                                {additionalRecipients.map((recipient, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                        <div>
                                            <p className="text-sm font-medium">{recipient.name || 'Unnamed'}</p>
                                            <p className="text-xs text-muted-foreground">{recipient.email}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeRecipient(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-2 border-t">
                        <p className="text-sm text-muted-foreground">
                            Total recipients: <strong>{totalRecipients}</strong>
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Message Type & Template */}
            <Card>
                <CardHeader>
                    <CardTitle>Message & Template</CardTitle>
                    <CardDescription>Customize your invitation message</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Message Type */}
                    <div>
                        <Label className="text-sm font-medium mb-3 block">Message Type</Label>
                        <RadioGroup value={messageType} onValueChange={(v: any) => setMessageType(v)}>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
                                <RadioGroupItem value="attendee" id="attendee" />
                                <Label htmlFor="attendee" className="flex-1 cursor-pointer">
                                    Attendee Message
                                    <span className="block text-xs text-muted-foreground mt-1">
                                        For guests attending the event
                                    </span>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/30 cursor-pointer">
                                <RadioGroupItem value="receiver" id="receiver" />
                                <Label htmlFor="receiver" className="flex-1 cursor-pointer">
                                    Speech Receiver Message
                                    <span className="block text-xs text-muted-foreground mt-1">
                                        For the person receiving the speech
                                    </span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Message Editor */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium">Message Template</Label>
                            <Button variant="ghost" size="sm" onClick={resetTemplate}>
                                Reset to Default
                            </Button>
                        </div>
                        <Textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            rows={10}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Use placeholders: <code className="bg-muted px-1 rounded">{'{name}'}</code>,{' '}
                            <code className="bg-muted px-1 rounded">{'{date}'}</code>,{' '}
                            <code className="bg-muted px-1 rounded">{'{venue}'}</code>,{' '}
                            <code className="bg-muted px-1 rounded">{'{time}'}</code>,{' '}
                            <code className="bg-muted px-1 rounded">{'{address}'}</code>
                        </p>
                    </div>

                    {/* Preview Button */}
                    <Dialog open={showPreview} onOpenChange={setShowPreview}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Eye className="w-4 h-4 mr-2" />
                                Preview Message
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Message Preview</DialogTitle>
                                <DialogDescription>
                                    This is how your message will appear to recipients
                                </DialogDescription>
                            </DialogHeader>
                            <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap font-serif">
                                {renderPreview()}
                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Postcard Option */}
            <Card className="relative overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Coming Soon
                    </Badge>
                </div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Postcard Delivery (Paid Feature)
                    </CardTitle>
                    <CardDescription>Send a physical postcard in addition to email</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 opacity-60">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                            <Checkbox
                                disabled
                                checked={sendViaPostcard}
                                onCheckedChange={(checked) => setSendViaPostcard(checked as boolean)}
                            />
                            <div>
                                <Label className="font-medium">Send via Physical Postcard</Label>
                                <p className="text-xs text-muted-foreground mt-1">$2.99 per postcard</p>
                            </div>
                        </div>
                    </div>

                    {postcardEligibility && !postcardEligibility.eligible && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                <Clock className="w-3 h-3 inline mr-1" />
                                Postcards require at least  5 days before the event. You have {postcardEligibility.daysUntilEvent} days remaining.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {/* Send Button */}
            <Button
                onClick={handleSend}
                disabled={isSending || totalRecipients === 0}
                className="w-full"
                size="lg"
            >
                <Mail className="w-4 h-4 mr-2" />
                {isSending ? 'Preparing...' : `Prepare ${totalRecipients} Invite${totalRecipients !== 1 ? 's' : ''}`}
            </Button>

            {totalRecipients === 0 && (
                <p className="text-sm text-center text-muted-foreground">
                    Select at least one recipient to prepare invites
                </p>
            )}
        </div>
    )
}
