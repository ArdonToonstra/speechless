'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { APIProvider, Map, Marker, AdvancedMarker, ControlPosition, MapControl, useMapsLibrary, useMap } from '@vis.gl/react-google-maps'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Search, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import type { LocationSettings } from '@/db/schema'
import { saveProjectLocation } from '@/actions/location'

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

// Place type categories for filtering (using new API types)
const PLACE_CATEGORIES = [
    { id: 'bar', label: 'Bars' },
    { id: 'restaurant', label: 'Restaurants' },
    { id: 'cafe', label: 'Cafes' },
    { id: 'event_venue', label: 'Event Venues' },
    { id: 'all', label: 'All Places' },
]

interface SearchResult {
    id: string
    name: string
    address: string
    lat: number
    lng: number
}

interface LocationPickerProps {
    projectId: number
    initialLocation?: LocationSettings
}

// Inner component that uses the new Places API
function PlacesSearch({
    onPlaceSelect,
    placeType,
    mapCenter
}: {
    onPlaceSelect: (place: SearchResult) => void
    placeType: string
    mapCenter: { lat: number, lng: number }
}) {
    const map = useMap()
    const placesLib = useMapsLibrary('places')
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    const performSearch = useCallback(async (query: string) => {
        if (!query || query.length < 2 || !placesLib || !map) {
            setResults([])
            return
        }

        setIsSearching(true)
        try {
            // Use the new Places API - searchByText
            const { Place } = placesLib as any

            const request: any = {
                textQuery: placeType && placeType !== 'all' ? `${placeType} ${query}` : query,
                fields: ['displayName', 'formattedAddress', 'location', 'id'],
                locationBias: {
                    center: mapCenter,
                    radius: 50000, // 50km radius
                },
                maxResultCount: 10,
            }

            // Include type if specified (and not 'all')
            if (placeType && placeType !== 'all') {
                request.includedType = placeType
            }

            const { places } = await Place.searchByText(request)

            if (places && places.length > 0) {
                const searchResults: SearchResult[] = places.map((place: any) => ({
                    id: place.id,
                    name: place.displayName || 'Unknown',
                    address: place.formattedAddress || '',
                    lat: place.location?.lat() || 0,
                    lng: place.location?.lng() || 0,
                }))
                setResults(searchResults)
            } else {
                setResults([])
            }
        } catch (error) {
            console.error('Search error:', error)
            // Fallback: try without type filter if it fails
            try {
                const { Place } = placesLib as any
                const { places } = await Place.searchByText({
                    textQuery: query,
                    fields: ['displayName', 'formattedAddress', 'location', 'id'],
                    locationBias: { center: mapCenter, radius: 50000 },
                    maxResultCount: 10,
                })

                if (places && places.length > 0) {
                    const searchResults: SearchResult[] = places.map((place: any) => ({
                        id: place.id,
                        name: place.displayName || 'Unknown',
                        address: place.formattedAddress || '',
                        lat: place.location?.lat() || 0,
                        lng: place.location?.lng() || 0,
                    }))
                    setResults(searchResults)
                } else {
                    setResults([])
                }
            } catch (fallbackError) {
                console.error('Fallback search error:', fallbackError)
                setResults([])
            }
        } finally {
            setIsSearching(false)
        }
    }, [placesLib, map, placeType, mapCenter])

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query)

        // Debounce the search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(() => {
            performSearch(query)
        }, 300)
    }, [performSearch])

    const handleSelectResult = useCallback((result: SearchResult) => {
        onPlaceSelect(result)
        setSearchQuery(result.name)
        setResults([])
    }, [onPlaceSelect])

    const clearSearch = () => {
        setSearchQuery('')
        setResults([])
    }

    return (
        <div className="m-2 bg-white rounded-lg shadow-lg w-80">
            <div className="p-2 flex gap-2 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search for a venue..."
                        value={searchQuery}
                        onChange={e => handleSearch(e.target.value)}
                        className="h-9 pl-8 pr-8"
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
                {isSearching && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>

            {results.length > 0 && (
                <div className="border-t max-h-64 overflow-y-auto">
                    {results.map((result) => (
                        <button
                            key={result.id}
                            className="w-full px-3 py-2 text-left hover:bg-muted/50 border-b last:border-b-0 text-sm"
                            onClick={() => handleSelectResult(result)}
                        >
                            <div className="font-medium truncate">{result.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                                {result.address}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export function LocationPicker({ projectId, initialLocation }: LocationPickerProps) {
    const [location, setLocation] = useState<LocationSettings | null>(initialLocation || null)
    const [isSaving, setIsSaving] = useState(false)
    const [placeType, setPlaceType] = useState('bar')
    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number }>({
        lat: initialLocation?.lat || 52.3676,
        lng: initialLocation?.lng || 4.9041
    })

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

    const handlePlaceSelect = useCallback((place: SearchResult) => {
        setLocation({
            lat: place.lat,
            lng: place.lng,
            address: place.address,
            placeId: place.id,
            name: place.name,
        })
        setMapCenter({ lat: place.lat, lng: place.lng })
    }, [])

    const onMapClick = useCallback((e: any) => {
        const lat = e.detail.latLng?.lat
        const lng = e.detail.latLng?.lng

        if (lat && lng) {
            setLocation({
                ...location,
                lat,
                lng,
                address: `Selected Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                placeId: undefined,
                name: undefined,
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
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className="text-primary w-5 h-5 shrink-0" />
                    <span className="font-semibold truncate">
                        {location?.name ? (
                            <>{location.name} <span className="font-normal text-muted-foreground">• {location.address}</span></>
                        ) : location?.address || 'No location selected'}
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
                        defaultZoom={13}
                        center={mapCenter}
                        onCenterChanged={(e) => setMapCenter(e.detail.center)}
                        gestureHandling={'greedy'}
                        disableDefaultUI={true}
                        zoomControl={true}
                        onClick={onMapClick}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {location?.lat && location?.lng && (
                            <Marker position={{ lat: location.lat, lng: location.lng }} />
                        )}

                        <MapControl position={ControlPosition.TOP_LEFT}>
                            <PlacesSearch
                                onPlaceSelect={handlePlaceSelect}
                                placeType={placeType}
                                mapCenter={mapCenter}
                            />
                        </MapControl>

                        <MapControl position={ControlPosition.TOP_RIGHT}>
                            <div className="m-2">
                                <Select value={placeType} onValueChange={setPlaceType}>
                                    <SelectTrigger className="w-40 bg-white shadow-lg h-9">
                                        <SelectValue placeholder="Filter by type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PLACE_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </MapControl>
                    </Map>
                </APIProvider>
            </div>
        </Card>
    )
}
