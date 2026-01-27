'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { APIProvider, Map, Marker, InfoWindow, ControlPosition, MapControl } from '@vis.gl/react-google-maps'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { LocationSettings } from '@/db/schema'
import { saveProjectLocation } from '@/actions/location'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

interface LocationPickerProps {
    projectId: number
    initialLocation?: LocationSettings
}

export function LocationPicker({ projectId, initialLocation }: LocationPickerProps) {
    const [location, setLocation] = useState<LocationSettings | null>(initialLocation || null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>({
        lat: initialLocation?.lat || 52.3676, // Default to Amsterdam if no location
        lng: initialLocation?.lng || 4.9041
    })

    // Update map center when location changes explicitly (e.g. initial load or selection)
    useEffect(() => {
        if (location?.lat && location?.lng) {
            setMapCenter({ lat: location.lat, lng: location.lng })
        }
    }, [location])

    const handleSave = async () => {
        if (!location) return

        setIsSaving(true)
        try {
            const result = await saveProjectLocation(projectId, location)
            if (result.success) {
                toast.success('Location saved successfully')
            } else {
                toast.error('Failed to save location')
            }
        } catch (error) {
            toast.error('An error occurred')
        } finally {
            setIsSaving(false)
        }
    }

    const handleSearch = async () => {
        // Basic search using geocoding service would go here or using the Autocomplete service
        // For simplified implementation without extra libs, we might just rely on map clicks or basic input
        // But let's implementing a basic text search if desired, or just rely on user clicking map for now 
        // since integrating full Places Autocomplete requires loading that library.

        // For now, let's keep it simple: Click on map to select.
        toast.info('Click on the map to select a location')
    }

    // Handler for clicking the map
    const onMapClick = useCallback((e: any) => {
        const lat = e.detail.latLng?.lat
        const lng = e.detail.latLng?.lng

        if (lat && lng) {
            setLocation({
                ...location,
                lat,
                lng,
                address: `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`, // Placeholder address
                placeId: undefined, // Clear place ID if picking raw coord
            })
        }
    }, [location])

    if (!API_KEY) {
        return (
            <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive">
                Missing Google Maps API Key in environment variables.
            </div>
        )
    }

    return (
        <Card className="w-full h-[600px] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between gap-4 bg-muted/20">
                <div className="flex items-center gap-2 flex-1">
                    <MapPin className="text-primary w-5 h-5" />
                    <span className="font-semibold">
                        {location?.address || 'No location selected'}
                    </span>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={!location || isSaving}
                    size="sm"
                >
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Location
                </Button>
            </div>

            <div className="flex-1 relative">
                <APIProvider apiKey={API_KEY}>
                    <Map
                        defaultCenter={mapCenter}
                        defaultZoom={12}
                        center={mapCenter}
                        onCenterChanged={(e) => setMapCenter(e.detail.center)}
                        gestureHandling={'greedy'}
                        disableDefaultUI={false}
                        onClick={onMapClick}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {location?.lat && location?.lng && (
                            <Marker position={{ lat: location.lat, lng: location.lng }} />
                        )}

                        <MapControl position={ControlPosition.TOP_LEFT}>
                            <div className="m-2 bg-white p-2 rounded-md shadow-md flex gap-2 w-72">
                                <Input
                                    placeholder="Search location..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    // Note: Real autocomplete would need the places library
                                    className="h-8"
                                />
                                <Button size="icon" className="h-8 w-8" onClick={() => toast.info('Geocoding implementation coming soon - please click map')}>
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </MapControl>
                    </Map>
                </APIProvider>
            </div>
        </Card>
    )
}
