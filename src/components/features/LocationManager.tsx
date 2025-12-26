'use client'

import React, { useState } from 'react'
import { updateProjectLocation } from '@/actions/location'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface LocationManagerProps {
    projectId: number
    location: {
        venue?: string | null
        address?: string | null
        time?: string | null
        notes?: string | null
    }
}

export function LocationManager({ projectId, location }: LocationManagerProps) {
    const [venue, setVenue] = useState(location?.venue || '')
    const [address, setAddress] = useState(location?.address || '')
    const [time, setTime] = useState(location?.time || '')
    const [notes, setNotes] = useState(location?.notes || '')
    const [isSaving, setIsSaving] = useState(false)

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        const formData = new FormData()
        formData.append('venue', venue)
        formData.append('address', address)
        formData.append('time', time)
        formData.append('notes', notes)

        const result = await updateProjectLocation(projectId, formData)

        setIsSaving(false)
        if (result?.error) {
            toast.error('Failed to save location details')
        } else {
            toast.success('Location details saved!')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Venue & Logistics</CardTitle>
                <CardDescription>Keep track of where and when the speech is happening.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="venue">Venue Name</Label>
                            <Input
                                id="venue"
                                placeholder="e.g. Grand Hotel"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time</Label>
                            <Input
                                id="time"
                                placeholder="e.g. 14:00"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            placeholder="123 Wedding Lane, City"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Logistics / Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Parking info, microphone check time, etc."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Details
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
