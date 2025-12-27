'use client'

import React, { useState } from 'react'
import { updateProjectLocation } from '@/actions/location'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Save, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

import { locations } from '@/data/mock-locations'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Building2, Ticket, MapPin } from 'lucide-react'

interface LocationManagerProps {
    projectId: number
    location: {
        slug?: string | null
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

    // Find the selected mock location if a slug exists
    const selectedMockLocation = location?.slug ? locations.find(l => l.slug === location?.slug) : null

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
        <div className="space-y-6">
            {/* Venue Selection Card */}
            <Card className="overflow-hidden border-2 border-slate-100 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="bg-slate-50/50 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                                Venue Selection
                            </CardTitle>
                            <CardDescription>Choose a venue from our curated collection or enter custom details.</CardDescription>
                        </div>
                        {selectedMockLocation && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">
                                <Ticket className="w-3 h-3 mr-1" /> Premium Venue
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {selectedMockLocation ? (
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                <Image
                                    src={selectedMockLocation.image}
                                    alt={selectedMockLocation.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <h3 className="text-lg font-bold text-slate-900">{selectedMockLocation.name}</h3>
                                <div className="flex gap-3 text-sm text-slate-500">
                                    <div className="flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {selectedMockLocation.city}
                                    </div>
                                    <div className="flex items-center">
                                        <Building2 className="w-3 h-3 mr-1" />
                                        {selectedMockLocation.type}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 line-clamp-2">{selectedMockLocation.description}</p>
                            </div>
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <Button asChild className="w-full bg-slate-900 text-white hover:bg-slate-800">
                                    <Link href={`/locations/${selectedMockLocation.slug}?projectId=${projectId}`}>
                                        View Details
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`/locations?projectId=${projectId}`}>
                                        Change Venue
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-900">No Venue Selected</h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Browse our catalogue of premium venues to find the perfect spot for your speech.</p>
                            <Button asChild className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-lg shadow-indigo-200">
                                <Link href={`/locations?projectId=${projectId}`}>
                                    Browse Venues <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Logistics & Details</CardTitle>
                    <CardDescription>Customize the specific details for the event.</CardDescription>
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
        </div>
    )
}
