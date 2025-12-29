import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    // Find the selected mock location if a slug exists
    const selectedMockLocation = location?.slug ? locations.find(l => l.slug === location?.slug) : null

    return (
        <div className="space-y-6">
            {/* Venue Selection Card */}
            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="border-b border-slate-100 bg-white/50 px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                                <Building2 className="w-6 h-6 text-primary" />
                                Venue Selection
                            </CardTitle>
                            <CardDescription className="text-slate-500 mt-1">Choose a venue from our curated collection.</CardDescription>
                        </div>
                        {selectedMockLocation && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                <Ticket className="w-3.5 h-3.5 mr-1.5" /> Premium Venue
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {selectedMockLocation ? (
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden shadow-md border border-slate-100 flex-shrink-0">
                                <Image
                                    src={selectedMockLocation.image}
                                    alt={selectedMockLocation.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 space-y-3">
                                <h3 className="text-lg font-bold text-slate-900">{selectedMockLocation.name}</h3>
                                <div className="flex gap-4 text-sm text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        {selectedMockLocation.city}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="w-4 h-4 text-slate-400" />
                                        {selectedMockLocation.type}
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{selectedMockLocation.description}</p>
                            </div>
                            <div className="flex flex-col gap-3 w-full md:w-auto">
                                <Button asChild className="w-full md:w-auto rounded-xl shadow-sm px-6">
                                    <Link href={`/locations/${selectedMockLocation.slug}?projectId=${projectId}`}>
                                        View Details
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full md:w-auto rounded-xl border-slate-200 hover:bg-slate-50">
                                    <Link href={`/locations?projectId=${projectId}`}>
                                        Change Venue
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <Building2 className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Venue Selected</h3>
                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">Browse our catalogue of premium venues to find the perfect spot for your speech.</p>
                            <Button asChild className="shadow-lg shadow-primary/20 rounded-xl px-6">
                                <Link href={`/locations?projectId=${projectId}`}>
                                    Browse Venues <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
